import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WWClient } from '@/api/WWClient';
import { toast } from 'sonner';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flyingBooks, setFlyingBooks] = useState([]); // for curved path animations

  // Local storage cart for guest users
  const [localCart, setLocalCart] = useState(() => {
    const saved = localStorage.getItem('guest_cart');
    return saved ? JSON.parse(saved) : { items: [], wishlist: [] };
  });

  useEffect(() => {
    localStorage.setItem('guest_cart', JSON.stringify(localCart));
  }, [localCart]);

  // Load user session
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await WWClient.auth.me();
        setUser(data);
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Fetch persistent cart for logged-in user
  const { data: cartData = { items: [], wishlist: [] }, refetch: refetchCart } = useQuery({
    queryKey: ['cart', user?._id || user?.id],
    queryFn: async () => {
      const response = await WWClient.custom.get('/cart');
      return response?.cart || { items: [], wishlist: [] };
    },
    enabled: !!(user?._id || user?.id),
    initialData: { items: [], wishlist: [] }
  });

  // Merge guest cart to backend cart on login
  useEffect(() => {
    if (user && localCart.items.length > 0) {
      const mergeCart = async () => {
        try {
          for (const item of localCart.items) {
            const id = typeof item === 'object' ? (item._id || item.id) : item;
            await WWClient.custom.post('/cart/add', { courseId: id });
          }
          setLocalCart({ items: [], wishlist: [] });
          queryClient.invalidateQueries({ queryKey: ['cart'] });
          toast.success('Synced your guest cart items!');
        } catch (err) {
          console.error("Cart sync failed:", err);
        }
      };
      mergeCart();
    }
  }, [user]);

  // Mutations
  const addToCartMutation = useMutation({
    mutationFn: (courseId) => WWClient.custom.post('/cart/add', { courseId }),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?._id || user?.id], data?.cart);
    }
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (courseId) => WWClient.custom.post('/cart/remove', { courseId }),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?._id || user?.id], data?.cart);
      toast.success('Removed course from cart');
    }
  });

  const saveForLaterMutation = useMutation({
    mutationFn: (courseId) => WWClient.custom.post('/cart/save-for-later', { courseId }),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?._id || user?.id], data?.cart);
      toast.success('Moved to Save for Later');
    }
  });

  const moveToCartMutation = useMutation({
    mutationFn: (courseId) => WWClient.custom.post('/cart/move-to-cart', { courseId }),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?._id || user?.id], data?.cart);
      toast.success('Moved course back to cart');
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: () => WWClient.custom.post('/cart/clear'),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', user?._id || user?.id], data?.cart);
    }
  });

  // Action wrappers
  const addToCart = async (course, e) => {
    const courseId = course._id || course.id;
    
    // Duplicate check
    const itemsList = user ? cartData.items : localCart.items;
    const exists = itemsList.some(item => {
      const id = typeof item === 'object' ? (item._id || item.id) : item;
      return id === courseId;
    });

    if (exists) {
      setDrawerOpen(true);
      return;
    }

    // Trigger book flying animation if event coordinates exist
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      const id = Date.now() + Math.random();
      
      setFlyingBooks(prev => [...prev, { id, startX, startY }]);
    }

    if (user) {
      await addToCartMutation.mutateAsync(courseId);
    } else {
      setLocalCart(prev => ({
        ...prev,
        items: [...prev.items, course]
      }));
    }
  };

  const removeFromCart = async (courseId) => {
    if (user) {
      await removeFromCartMutation.mutateAsync(courseId);
    } else {
      setLocalCart(prev => ({
        ...prev,
        items: prev.items.filter(item => {
          const id = typeof item === 'object' ? (item._id || item.id) : item;
          return id !== courseId;
        })
      }));
      toast.success('Removed course from cart');
    }
  };

  const saveForLater = async (course) => {
    const courseId = course._id || course.id;
    if (user) {
      await saveForLaterMutation.mutateAsync(courseId);
    } else {
      setLocalCart(prev => ({
        items: prev.items.filter(item => (item._id || item.id) !== courseId),
        wishlist: [...prev.wishlist, course]
      }));
      toast.success('Moved to Save for Later');
    }
  };

  const moveToCart = async (courseId, e) => {
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      const id = Date.now() + Math.random();
      setFlyingBooks(prev => [...prev, { id, startX, startY }]);
    }

    if (user) {
      await moveToCartMutation.mutateAsync(courseId);
    } else {
      // Find item in wishlist
      const item = localCart.wishlist.find(i => (i._id || i.id) === courseId);
      if (item) {
        setLocalCart(prev => ({
          wishlist: prev.wishlist.filter(i => (i._id || i.id) !== courseId),
          items: [...prev.items, item]
        }));
      }
      toast.success('Moved course back to cart');
    }
  };

  const clearCart = async () => {
    if (user) {
      await clearCartMutation.mutateAsync();
    } else {
      setLocalCart({ items: [], wishlist: [] });
    }
  };

  const items = user ? cartData.items : localCart.items;
  const wishlist = user ? cartData.wishlist : localCart.wishlist;

  return (
    <CartContext.Provider value={{
      items,
      wishlist,
      drawerOpen,
      setDrawerOpen,
      flyingBooks,
      setFlyingBooks,
      addToCart,
      removeFromCart,
      saveForLater,
      moveToCart,
      clearCart,
      isPending: addToCartMutation.isPending || removeFromCartMutation.isPending
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

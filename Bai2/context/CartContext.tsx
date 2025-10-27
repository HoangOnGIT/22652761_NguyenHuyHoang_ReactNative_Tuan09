import { Food } from "@/app/drinks";
import { createContext, ReactNode, useContext, useState } from "react";

export interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Food) => void;
  removeFromCart: (id: string) => void;
  decreaseQuantity: (item: Food) => void;
  increaseQuantity: (item: Food) => void;
  clearCart: () => void;
}

export interface CartItem {
  item: Food;
  quantity: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const addToCart = (item: Food) => {
    console.log(`cart b4 adding: `, cart);

    const existingIndex = cart.findIndex(
      (cartItem) => cartItem.item.id === item.id
    );

    if (existingIndex < 0) {
      setCart([...cart, { item, quantity: 1 }]);
    } else {
      let newCart = cart.map((cartItem) => {
        if (cartItem.item.id === item.id)
          return { ...cartItem, quantity: cartItem.quantity + 1 };
        else return cartItem;
      });
      setCart(newCart);
    }
    console.log(`cart a4 adding: `, cart);
  };
  const removeFromCart = (id: string) => {
    let newCart = cart.filter((cartItem) => cartItem.item.id !== id);
    setCart(newCart);
  };
  const decreaseQuantity = (item: Food) => {
    const existingIndex = cart.findIndex(
      (cartItem) => cartItem.item.id === item.id
    );

    if (existingIndex >= 0) {
      let newCart = cart.map((cartItem) => {
        if (cartItem.item.id === item.id)
          return { ...cartItem, quantity: cartItem.quantity - 1 };
        else return cartItem;
      });
      setCart(newCart);
    }
  };
  const increaseQuantity = (item: Food) => {
    const existingIndex = cart.findIndex(
      (cartItem) => cartItem.item.id === item.id
    );

    if (existingIndex >= 0) {
      let newCart = cart.map((cartItem) => {
        if (cartItem.item.id === item.id)
          return { ...cartItem, quantity: cartItem.quantity + 1 };
        else return cartItem;
      });
      setCart(newCart);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    decreaseQuantity,
    increaseQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

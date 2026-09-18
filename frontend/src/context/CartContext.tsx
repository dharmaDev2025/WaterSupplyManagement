import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ==========================================
// TYPES
// ==========================================

export type PurchaseType =
  | "new-jar"
  | "refill"
  | "bottle";

export interface CartItem {
  productId: string;
  name: string;

  productType: "jar" | "bottle";

  purchaseType: PurchaseType;

  quantity: number;

  // Used only for frontend display
  price: number;

  size: number;
  unit: "ml" | "liter";

  stock: number;
}

// ==========================================
// CONTEXT TYPE
// ==========================================

interface CartContextType {
  cartItems: CartItem[];

  cartCount: number;

  totalAmount: number;

  addToCart: (item: CartItem) => void;

  removeFromCart: (
    productId: string,
    purchaseType: PurchaseType
  ) => void;

  updateQuantity: (
    productId: string,
    purchaseType: PurchaseType,
    quantity: number
  ) => void;

  clearCart: () => void;
}

// ==========================================
// CREATE CONTEXT
// ==========================================

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

// ==========================================
// CART PROVIDER
// ==========================================

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Load existing cart from localStorage
  const [cartItems, setCartItems] =
    useState<CartItem[]>(() => {
      try {
        const savedCart =
          localStorage.getItem("cart");

        if (!savedCart) {
          return [];
        }

        return JSON.parse(savedCart);
      } catch {
        return [];
      }
    });

  // ==========================================
  // SAVE CART
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = (item: CartItem) => {
    setCartItems((currentItems) => {
      // Same product + same purchase type
      const existingItem =
        currentItems.find(
          (cartItem) =>
            cartItem.productId ===
              item.productId &&
            cartItem.purchaseType ===
              item.purchaseType
        );

      // Already exists → increase quantity
      if (existingItem) {
        return currentItems.map(
          (cartItem) => {
            if (
              cartItem.productId ===
                item.productId &&
              cartItem.purchaseType ===
                item.purchaseType
            ) {
              return {
                ...cartItem,

                quantity: Math.min(
                  cartItem.quantity +
                    item.quantity,

                  item.stock
                ),
              };
            }

            return cartItem;
          }
        );
      }

      // New item
      return [...currentItems, item];
    });
  };

  // ==========================================
  // REMOVE FROM CART
  // ==========================================

  const removeFromCart = (
    productId: string,
    purchaseType: PurchaseType
  ) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.purchaseType ===
              purchaseType
          )
      )
    );
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const updateQuantity = (
    productId: string,
    purchaseType: PurchaseType,
    quantity: number
  ) => {
    if (quantity < 1) {
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (
          item.productId === productId &&
          item.purchaseType ===
            purchaseType
        ) {
          return {
            ...item,

            quantity: Math.min(
              quantity,
              item.stock
            ),
          };
        }

        return item;
      })
    );
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = () => {
    setCartItems([]);
  };

  // ==========================================
  // CART COUNT
  // ==========================================

  const cartCount =
    cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  // ==========================================
  // DISPLAY TOTAL
  // ==========================================

  const totalAmount =
    cartItems.reduce(
      (total, item) =>
        total +
        item.price * item.quantity,
      0
    );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        totalAmount,

        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRecentOrders = useRecentOrders;
const react_1 = require("react");
const LOCAL_STORAGE_KEY = "recentOrders";
const MAX_RECENT_ORDERS = 5;
function useRecentOrders() {
    const [recentOrders, setRecentOrders] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        // Load from local storage on initial mount
        const storedOrders = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedOrders) {
            try {
                setRecentOrders(JSON.parse(storedOrders));
            }
            catch (e) {
                console.error("Failed to parse recent orders from local storage", e);
                // Clear invalid data
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
        }
    }, []);
    const addRecentOrder = (order) => {
        setRecentOrders((currentOrders) => {
            // Remove if already exists
            const filteredOrders = currentOrders.filter((o) => o.id !== order.id);
            // Add new order to the beginning
            const newOrders = [order, ...filteredOrders];
            // Trim to max number of orders
            const finalOrders = newOrders.slice(0, MAX_RECENT_ORDERS);
            // Save to local storage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalOrders));
            return finalOrders;
        });
    };
    return { recentOrders, addRecentOrder };
}

// Stock Management System for Beaded Bliss
// This file provides functions to check and manage product stock status

class StockManager {
    constructor() {
        this.stockData = this.loadStockData();
    }

    loadStockData() {
        try {
            const savedData = localStorage.getItem('productStockData');
            if (savedData) {
                return JSON.parse(savedData);
            }
            // If no data, get defaults, save them, then return them.
            const defaultData = this.getDefaultStockData();
            localStorage.setItem('productStockData', JSON.stringify(defaultData));
            return defaultData;
        } catch (error) {
            console.error('Error loading stock data:', error);
            // Fallback in case of parsing errors etc.
            const defaultData = this.getDefaultStockData();
            localStorage.setItem('productStockData', JSON.stringify(defaultData));
            return defaultData;
        }
    }

    getDefaultStockData() {
        return [
            // Bracelets Category
            {
                id: 'ocean-bloom',
                name: 'Ocean Bloom',
                category: 'Bracelets',
                price: 50,
                image: '/photos/flower.jpg',
                inStock: true,
                stockQuantity: 5
            },
            {
                id: 'sunset-pearl',
                name: 'Sunset Pearl',
                category: 'Bracelets',
                price: 50,
                image: '/photos/orange.png',
                inStock: true,
                stockQuantity: 3
            },
            {
                id: 'moonlight-charm',
                name: 'Moonlight Charm',
                category: 'Bracelets',
                price: 50,
                image: '/photos/star.png',
                inStock: true,
                stockQuantity: 4
            },
            {
                id: 'floral-grace',
                name: 'Floral Grace',
                category: 'Bracelets',
                price: 50,
                image: '/photos/jasmine.png',
                inStock: false,
                stockQuantity: 0
            },
            {
                id: 'midnight-shine',
                name: 'Midnight Shine',
                category: 'Bracelets',
                price: 50,
                image: '/photos/black1.jpg',
                inStock: true,
                stockQuantity: 2
            },
            {
                id: 'azure-dream',
                name: 'Azure Dream',
                category: 'Bracelets',
                price: 50,
                image: '/photos/blue.png',
                inStock: true,
                stockQuantity: 6
            },
            {
                id: 'twilight-drops',
                name: 'Twilight Drops',
                category: 'Bracelets',
                price: 50,
                image: '/photos/stars.png',
                inStock: true,
                stockQuantity: 3
            },
            {
                id: 'lime-bloom',
                name: 'Lime Bloom',
                category: 'Bracelets',
                price: 50,
                image: '/photos/Bloom.png',
                inStock: true,
                stockQuantity: 4
            },
            // New Bracelet Products
            {
                id: 'blush-wings',
                name: 'Blush Wings',
                category: 'Bracelets',
                price: 50,
                image: '/photos/flies.png',
                inStock: true,
                stockQuantity: 5
            },
            {
                id: 'heart-bloom',
                name: 'Heart Bloom',
                category: 'Bracelets',
                price: 50,
                image: '/photos/fly.png',
                inStock: true,
                stockQuantity: 4
            },
            {
                id: 'dots-edition',
                name: 'DOTS Edition',
                category: 'Bracelets',
                price: 50,
                image: '/photos/dots.png',
                inStock: true,
                stockQuantity: 3
            },
            {
                id: 'queen-edition',
                name: 'QUEEN Edition',
                category: 'Bracelets',
                price: 50,
                image: '/photos/queen.png',
                inStock: true,
                stockQuantity: 2
            },
            // Crochet Category (Knot & Carry)
            {
                id: 'olive-bloom',
                name: 'Olive Bloom',
                category: 'Crochet',
                price: 499,
                image: '/photos/green bag.png',
                inStock: true,
                stockQuantity: 3
            },
            {
                id: 'cherry-ember',
                name: 'Cherry Ember',
                category: 'Crochet',
                price: 499,
                image: '/photos/red bag.png',
                inStock: true,
                stockQuantity: 2
            },
            // Clay Category (ClayClicks)
            {
                id: 'avobuds',
                name: 'AvoBuds',
                category: 'Clay',
                price: 349,
                image: '/photos/avacado.webp',
                inStock: true,
                stockQuantity: 4
            }
        ];
    }

    getProductStock(productName) {
        const product = this.stockData.find(p => p.name === productName);
        return product || { inStock: true, stockQuantity: 0 };
    }

    isInStock(productName) {
        const product = this.getProductStock(productName);
        return product.inStock && product.stockQuantity > 0;
    }

    getStockQuantity(productName) {
        const product = this.getProductStock(productName);
        return product.stockQuantity || 0;
    }

    updateStockStatus(productName, inStock, quantity = null) {
        const product = this.stockData.find(p => p.name === productName);
        if (product) {
            product.inStock = inStock;
            if (quantity !== null) {
                product.stockQuantity = quantity;
            }
            if (!inStock) {
                product.stockQuantity = 0;
            }
            this.saveStockData();
        }
    }

    decreaseStock(productName, quantityToDecrease) {
        const product = this.stockData.find(p => p.name === productName);
        if (product) {
            const newQuantity = product.stockQuantity - quantityToDecrease;
            product.stockQuantity = Math.max(0, newQuantity); // Don't go below zero
            if (product.stockQuantity === 0) {
                product.inStock = false;
            }
            this.saveStockData();
            console.log(`Stock for ${productName} reduced by ${quantityToDecrease}. New quantity: ${product.stockQuantity}`);
        }
    }

    saveStockData() {
        localStorage.setItem('productStockData', JSON.stringify(this.stockData));
    }

    refreshStockData() {
        this.stockData = this.loadStockData();
    }
}

// Create global instance
window.stockManager = new StockManager();

// Utility functions for easy access
window.checkStock = function(productName) {
    return window.stockManager.isInStock(productName);
};

window.getStockQuantity = function(productName) {
    return window.stockManager.getStockQuantity(productName);
};

window.updateStock = function(productName, inStock, quantity) {
    window.stockManager.updateStockStatus(productName, inStock, quantity);
};

window.decreaseStock = function(productName, quantity) {
    window.stockManager.decreaseStock(productName, quantity);
}; 
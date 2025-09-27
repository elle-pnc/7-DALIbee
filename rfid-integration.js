/**
 * RFID Integration Script for 7-Evelyn POS System
 * This script allows the RFID simulator to communicate with the main POS system
 */

class RFIDIntegration {
    constructor() {
        this.isConnected = false;
        this.posWindow = null;
        this.retryCount = 0;
        this.maxRetries = 5;
    }

    /**
     * Connect to the main POS system window
     */
    connectToPOS() {
        try {
            // Try to find the main POS window
            if (window.opener && window.opener.location.pathname.includes('index.html')) {
                this.posWindow = window.opener;
                this.isConnected = true;
                console.log('✅ Connected to main POS system');
                return true;
            }
            
            // Alternative: try to find by window name
            const posWindow = window.open('', 'pos-system');
            if (posWindow && !posWindow.closed) {
                this.posWindow = posWindow;
                this.isConnected = true;
                console.log('✅ Connected to main POS system via window name');
                return true;
            }
            
            console.log('⚠️ Main POS system not found. Running in standalone mode.');
            return false;
        } catch (error) {
            console.error('❌ Error connecting to POS system:', error);
            return false;
        }
    }

    /**
     * Send RFID scan data to the main POS system
     * @param {string} productId - The product ID to scan
     */
    sendRFIDScan(productId) {
        if (!this.isConnected || !this.posWindow) {
            console.log('📡 RFID Scan (Standalone):', productId);
            this.showStandaloneNotification(productId);
            return;
        }

        try {
            // Send message to main POS system
            this.posWindow.postMessage({
                type: 'RFID_SCAN',
                productId: productId,
                timestamp: new Date().toISOString()
            }, '*');

            console.log('📤 RFID Scan sent to POS:', productId);
        } catch (error) {
            console.error('❌ Error sending RFID scan:', error);
            this.showStandaloneNotification(productId);
        }
    }

    /**
     * Show notification when running in standalone mode
     * @param {string} productId - The product ID that was scanned
     */
    showStandaloneNotification(productId) {
        const products = {
            "bananas": { name: "Bananas", emoji: "🍌" },
            "apples": { name: "Apples", emoji: "🍎" },
            "bread": { name: "Bread", emoji: "🍞" },
            "milk": { name: "Milk", emoji: "🥛" },
            "eggs": { name: "Eggs", emoji: "🥚" },
            "chicken": { name: "Chicken", emoji: "🍗" },
            "rice": { name: "Rice", emoji: "🍚" },
            "tomatoes": { name: "Tomatoes", emoji: "🍅" },
            "cheese": { name: "Cheese", emoji: "🧀" },
            "cereal": { name: "Cereal", emoji: "🥣" },
            "orange-juice": { name: "Orange Juice", emoji: "🧃" },
            "pasta": { name: "Pasta", emoji: "🍝" }
        };

        const product = products[productId];
        if (product) {
            alert(`📡 RFID Scan Detected!\n\n${product.emoji} ${product.name}\n\nProduct ID: ${productId}\n\nNote: Open the main POS system to process this scan.`);
        } else {
            alert(`❌ Invalid RFID Scan\n\nProduct ID: ${productId}\n\nThis product is not recognized.`);
        }
    }

    /**
     * Listen for messages from the main POS system
     */
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'POS_RESPONSE') {
                console.log('📥 Response from POS:', event.data);
                this.handlePOSResponse(event.data);
            }
        });
    }

    /**
     * Handle response from the main POS system
     * @param {Object} response - The response data from POS
     */
    handlePOSResponse(response) {
        if (response.success) {
            console.log('✅ POS processed RFID scan successfully');
        } else {
            console.log('❌ POS failed to process RFID scan:', response.error);
        }
    }

    /**
     * Initialize the RFID integration
     */
    init() {
        this.setupMessageListener();
        this.connectToPOS();
        
        // Retry connection every 5 seconds if not connected
        if (!this.isConnected) {
            const retryInterval = setInterval(() => {
                if (this.connectToPOS() || this.retryCount >= this.maxRetries) {
                    clearInterval(retryInterval);
                }
                this.retryCount++;
            }, 5000);
        }
    }
}

// Global RFID integration instance
window.rfidIntegration = new RFIDIntegration();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rfidIntegration.init();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RFIDIntegration;
}



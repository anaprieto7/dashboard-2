'use strict';

/**
 * Module to initialize the guided tour (onboarding) for the product list page.
 */
function initializeOnboardingTour() {
    // ===================================================================================
    // 1. CONSTANTS AND VARIABLES DECLARATION
    // ===================================================================================
    const tourKey = 'productListPageTourCompleted_v1'; // Key for localStorage.

    // ===================================================================================
    // 2. FUNCTION DEFINITIONS
    // ===================================================================================

    /**
     * Starts the tour if the user has not completed it before.
     */
    function startTour() {
        // Do not start the tour if it has already been completed.
        if (localStorage.getItem(tourKey)) {
            return;
        }

        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: 'shadow-md',
                scrollTo: { behavior: 'smooth', block: 'center' },
                cancelIcon: {
                    enabled: true
                }
            }
        });

        // --- TOUR STEPS DEFINITION ---

        tour.addStep({
            id: 'welcome',
            title: 'Welcome to the Product List!',
            text: 'This is a quick tour to show you the new features. You can skip it at any time.',
            buttons: [
                {
                    action() {
                        return this.cancel();
                    },
                    secondary: true,
                    text: 'Skip Tour'
                },
                {
                    action() {
                        return this.next();
                    },
                    text: 'Start'
                }
            ]
        });

        tour.addStep({
            id: 'search-filter',
            title: 'Quick Filters',
            text: 'Use these fields to quickly filter by name, customer, status, or minimum stock. The results update instantly.',
            attachTo: {
                element: '.card-header', // Attaches to the header of the filters card
                on: 'bottom'
            },
            buttons: [{ action() { return this.back(); }, secondary: true, text: 'Back' }, { action() { return this.next(); }, text: 'Next' }]
        });
        
        tour.addStep({
            id: 'advanced-btn',
            title: 'Advanced Filters',
            text: 'Click here to expand more detailed filters, such as quantity, weight, or date ranges.',
            attachTo: {
                element: '#advanced-filters-btn-toggle', // The button that expands the panel
                on: 'bottom'
            },
            buttons: [{ action() { return this.back(); }, secondary: true, text: 'Back' }, { action() { return this.next(); }, text: 'Next' }]
        });

        tour.addStep({
            id: 'saved-views',
            title: 'Saved Views',
            text: 'Do you often use the same filters? Save them as a "view" to quickly load them with a single click.',
            attachTo: {
                element: '#saved-views-btn',
                on: 'bottom'
            },
            buttons: [{ action() { return this.back(); }, secondary: true, text: 'Back' }, { action() { return this.next(); }, text: 'Next' }]
        });

        tour.addStep({
            id: 'table-actions',
            title: 'Table Actions',
            text: 'Here you can view the details of a specific product or edit it directly.',
            attachTo: {
                element: '.datatables-products tbody tr:first-child td:last-child', // Actions on the first row
                on: 'left'
            },
            buttons: [{ action() { return this.back(); }, secondary: true, text: 'Back' }, { action() { return this.next(); }, text: 'Next' }]
        });
        
        
        tour.addStep({
            id: 'finish',
            title: 'All Set!',
            text: 'You have completed the tour. You can now start exploring all the features.',
            buttons: [{ action() { return this.complete(); }, text: 'Finish' }]
        });
        

        // --- TOUR EVENT HANDLING ---
        const onTourEnd = () => {
            localStorage.setItem(tourKey, 'true');
        };
        tour.on('complete', onTourEnd);
        tour.on('cancel', onTourEnd);

        // Start the tour
        tour.start();
    }

    // ===================================================================================
    // 3. INITIALIZATION
    // ===================================================================================
    startTour();
}


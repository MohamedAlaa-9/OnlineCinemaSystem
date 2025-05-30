        // Get booking details from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const movie = urlParams.get('movie') || 'Avengers: Endgame';
        const date = urlParams.get('date') || '2023-05-20';
        const time = urlParams.get('time') || '10:00 AM';
        const tickets = parseInt(urlParams.get('tickets') || '2');
        const subtotal = tickets * 12;
        const bookingFee = 2;
        const tax = Math.round(subtotal * 0.1 * 100) / 100;
        const total = subtotal + bookingFee + tax;
        
        // Format date
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Update order summary
        document.getElementById('summaryMovieTitle').textContent = movie;
        document.getElementById('summaryDateTime').textContent = `${formattedDate} | ${time}`;
        document.getElementById('summaryTickets').textContent = `${tickets} Ticket${tickets > 1 ? 's' : ''}`;
        document.getElementById('summaryTicketPrice').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
        
        // Set hidden form fields
        document.getElementById('movieInput').value = movie;
        document.getElementById('dateInput').value = date;
        document.getElementById('timeInput').value = time;
        document.getElementById('ticketsInput').value = tickets;
        
        // Update page title
        document.title = `Payment for ${movie} - Cinema`;
        
        // Credit card validation
        const cardNumberInput = document.getElementById('cardNumber');
        const expiryDateInput = document.getElementById('expiryDate');
        const cvvInput = document.getElementById('cvv');
        const cardHolderInput = document.getElementById('cardHolder');
        const emailInput = document.getElementById('email');
        const paymentForm = document.getElementById('paymentForm');
        
        // Egyptian Visa form elements
        const egyptianCardNumberInput = document.getElementById('egyptianCardNumber');
        const egyptianCardHolderInput = document.getElementById('egyptianCardHolder');
        const egyptianExpiryDateInput = document.getElementById('egyptianExpiryDate');
        const egyptianCvvInput = document.getElementById('egyptianCvv');
        
        // Meza form elements
        const mezaCardNumberInput = document.getElementById('mezaCardNumber');
        const mezaCardHolderInput = document.getElementById('mezaCardHolder');
        const mezaExpiryDateInput = document.getElementById('mezaExpiryDate');
        const mezaCvvInput = document.getElementById('mezaCvv');
        
        // Card type detection
        function detectCardType(cardNumber) {
            // Remove spaces and dashes
            const cleanNumber = cardNumber.replace(/[\s-]/g, '');
            
            // Visa
            if (/^4/.test(cleanNumber)) {
                return {
                    type: 'visa',
                    name: 'Visa',
                    length: [16],
                    cvvLength: 3
                };
            }
            
            // Mastercard
            if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
                return {
                    type: 'mastercard',
                    name: 'Mastercard',
                    length: [16],
                    cvvLength: 3
                };
            }
            
            // American Express
            if (/^3[47]/.test(cleanNumber)) {
                return {
                    type: 'amex',
                    name: 'American Express',
                    length: [15],
                    cvvLength: 4
                };
            }
            
            // Egyptian Visa
            if (/^4[0-9]{3}/.test(cleanNumber) && cleanNumber.length === 16) {
                return {
                    type: 'egyptian-visa',
                    name: 'Egyptian Visa',
                    length: [16],
                    cvvLength: 3
                };
            }
            
            // Meza
            if (/^5[0-9]{3}/.test(cleanNumber) && cleanNumber.length === 16) {
                return {
                    type: 'meza',
                    name: 'Meza',
                    length: [16],
                    cvvLength: 3
                };
            }
            
            return {
                type: 'unknown',
                name: 'Unknown',
                length: [16],
                cvvLength: 3
            };
        }
        
        // Luhn algorithm for credit card validation
        function validateLuhn(cardNumber) {
            const digits = cardNumber.replace(/\D/g, '');
            let sum = 0;
            let shouldDouble = false;
            
            // Loop from right to left
            for (let i = digits.length - 1; i >= 0; i--) {
                let digit = parseInt(digits.charAt(i));
                
                if (shouldDouble) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }
                
                sum += digit;
                shouldDouble = !shouldDouble;
            }
            
            return sum % 10 === 0;
        }
        
        // Function to show only one feedback message at a time
        function showFeedback(input, isValid, message = null) {
            const validFeedback = input.parentElement.querySelector('.valid-feedback');
            const invalidFeedback = input.parentElement.querySelector('.invalid-feedback');
            
            // Hide both feedbacks initially
            validFeedback.style.display = 'none';
            invalidFeedback.style.display = 'none';
            
            if (isValid) {
                input.classList.add('is-valid');
                input.classList.remove('is-invalid');
                validFeedback.style.display = 'block';
            } else if (input.value.trim() !== '') {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
                if (message) {
                    invalidFeedback.textContent = message;
                }
                invalidFeedback.style.display = 'block';
            } else {
                input.classList.remove('is-valid');
                input.classList.remove('is-invalid');
            }
        }
        
        // Validate card number
        function validateCardNumber(input) {
            let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            input.value = formattedValue;
            
            // Detect card type
            const cardType = detectCardType(value);
            
            // Update CVV max length if this is the main card input
            if (input === cardNumberInput) {
                cvvInput.maxLength = cardType.cvvLength;
            }
            
            // Auto-select card type based on number
            if (value.length >= 4) {
                if (cardType.type === 'visa') {
                    selectPaymentMethod('credit-card');
                } else if (cardType.type === 'mastercard') {
                    selectPaymentMethod('mastercard');
                } else if (cardType.type === 'amex') {
                    selectPaymentMethod('amex');
                } else if (cardType.type === 'egyptian-visa') {
                    selectPaymentMethod('egyptian-visa');
                } else if (cardType.type === 'meza') {
                    selectPaymentMethod('meza');
                }
            }
            
            // Validate card number length and Luhn algorithm
            if (value.length > 0) {
                const isValidLength = cardType.length.includes(value.length);
                
                if (!isValidLength && value.length >= Math.max(...cardType.length)) {
                    showFeedback(input, false, `Card number should be ${cardType.length.join(' or ')} digits.`);
                    return false;
                } else if (value.length >= Math.min(...cardType.length)) {
                    // Check Luhn algorithm for complete numbers
                    if (!validateLuhn(value)) {
                        showFeedback(input, false, 'Invalid card number. Please check and try again.');
                        return false;
                    } else {
                        showFeedback(input, true);
                        return true;
                    }
                } else {
                    // Not complete yet, but no error
                    input.classList.remove('is-valid');
                    input.classList.remove('is-invalid');
                    return false;
                }
            } else {
                input.classList.remove('is-valid');
                input.classList.remove('is-invalid');
                return false;
            }
        }
        
        // Validate card holder name
        function validateCardHolder(input) {
            const value = input.value.trim();
            
            if (value.length >= 3 && /^[A-Za-z\s]+$/.test(value)) {
                showFeedback(input, true);
                return true;
            } else if (value.length > 0) {
                showFeedback(input, false, 'Please enter a valid cardholder name.');
                return false;
            } else {
                input.classList.remove('is-valid');
                input.classList.remove('is-invalid');
                return false;
            }
        }
        
        // Validate expiry date
        function validateExpiryDate(input) {
            let value = input.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                // Format with slash
                if (value.length > 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    input.value = value;
                }
                
                // Validate month
                if (value.length >= 2) {
                    const month = parseInt(value.substring(0, 2));
                    if (month < 1 || month > 12) {
                        showFeedback(input, false, 'Month must be between 01 and 12.');
                        return false;
                    } else if (value.length >= 5) {
                        const year = parseInt('20' + value.substring(3, 5));
                        const currentYear = new Date().getFullYear();
                        const currentMonth = new Date().getMonth() + 1; // January is 0
                        
                        if (year < currentYear || (year === currentYear && month < currentMonth)) {
                            showFeedback(input, false, 'Card has expired.');
                            return false;
                        } else {
                            showFeedback(input, true);
                            return true;
                        }
                    } else {
                        // Not complete yet, but no error
                        input.classList.remove('is-valid');
                        input.classList.remove('is-invalid');
                        return false;
                    }
                } else {
                    input.classList.remove('is-valid');
                    input.classList.remove('is-invalid');
                    return false;
                }
            } else {
                input.classList.remove('is-valid');
                input.classList.remove('is-invalid');
                return false;
            }
        }
        
        // Validate CVV
        function validateCVV(input, cardNumberInput) {
            let value = input.value.replace(/\D/g, '');
            input.value = value;
            
            const cardType = detectCardType(cardNumberInput.value.replace(/\s+/g, ''));
            
            if (value.length > 0) {
                if (value.length === cardType.cvvLength) {
                    showFeedback(input, true);
                    return true;
                } else {
                    showFeedback(input, false, `CVV must be ${cardType.cvvLength} digits.`);
                    return false;
                }
            } else {
                input.classList.remove('is-valid');
                input.classList.remove('is-invalid');
                return false;
            }
        }
        
        // Validate email
        function validateEmail(input) {
            const value = input.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (value.length > 0) {
                if (emailRegex.test(value)) {
                    showFeedback(input, true);
                    return true;
                } else {
                    showFeedback(input, false, 'Please enter a valid email address.');
                    return false;
                }
            } else {
                input.classList.remove('is-valid');
                input.classList.remove('is-invalid');
                return false;
            }
        }
        
        // Add event listeners for standard credit card form
        cardNumberInput.addEventListener('input', function() {
            validateCardNumber(this);
        });
        
        cardHolderInput.addEventListener('input', function() {
            validateCardHolder(this);
        });
        
        expiryDateInput.addEventListener('input', function() {
            validateExpiryDate(this);
        });
        
        cvvInput.addEventListener('input', function() {
            validateCVV(this, cardNumberInput);
        });
        
        // Add event listeners for Egyptian Visa form
        egyptianCardNumberInput.addEventListener('input', function() {
            validateCardNumber(this);
        });
        
        egyptianCardHolderInput.addEventListener('input', function() {
            validateCardHolder(this);
        });
        
        egyptianExpiryDateInput.addEventListener('input', function() {
            validateExpiryDate(this);
        });
        
        egyptianCvvInput.addEventListener('input', function() {
            validateCVV(this, egyptianCardNumberInput);
        });
        
        // Add event listeners for Meza form
        mezaCardNumberInput.addEventListener('input', function() {
            validateCardNumber(this);
        });
        
        mezaCardHolderInput.addEventListener('input', function() {
            validateCardHolder(this);
        });
        
        mezaExpiryDateInput.addEventListener('input', function() {
            validateExpiryDate(this);
        });
        
        mezaCvvInput.addEventListener('input', function() {
            validateCVV(this, mezaCardNumberInput);
        });
        
        emailInput.addEventListener('input', function() {
            validateEmail(this);
        });
        
        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        const creditCardForm = document.getElementById('creditCardForm');
        const egyptianVisaForm = document.getElementById('egyptianVisaForm');
        const mezaForm = document.getElementById('mezaForm');
        
        function selectPaymentMethod(methodType) {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            
            // Add active class to selected method
            document.querySelector(`.payment-method[data-method="${methodType}"]`).classList.add('active');
            
            // Hide all forms
            creditCardForm.style.display = 'none';
            egyptianVisaForm.style.display = 'none';
            mezaForm.style.display = 'none';
            
            // Show selected form
            if (methodType === 'credit-card' || methodType === 'mastercard' || methodType === 'amex') {
                creditCardForm.style.display = 'block';
            } else if (methodType === 'egyptian-visa') {
                egyptianVisaForm.style.display = 'block';
            } else if (methodType === 'meza') {
                mezaForm.style.display = 'block';
            }
            
            // Update button text
            const completePaymentBtn = document.getElementById('completePaymentBtn');
            if (methodType === 'egyptian-visa') {
                completePaymentBtn.innerHTML = '<i class="fas fa-credit-card me-2"></i>Pay with Egyptian Visa';
            } else if (methodType === 'meza') {
                completePaymentBtn.innerHTML = '<i class="fas fa-credit-card me-2"></i>Pay with Meza';
            } else if (methodType === 'mastercard') {
                completePaymentBtn.innerHTML = '<i class="fas fa-credit-card me-2"></i>Pay with Mastercard';
            } else if (methodType === 'amex') {
                completePaymentBtn.innerHTML = '<i class="fas fa-credit-card me-2"></i>Pay with American Express';
            } else {
                completePaymentBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Complete Payment';
            }
        }
        
        // Add click event listeners to payment methods
        paymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                const methodType = this.getAttribute('data-method');
                selectPaymentMethod(methodType);
            });
        });
        
        // Form validation on submit
        paymentForm.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Get active payment method
            const activeMethod = document.querySelector('.payment-method.active');
            const methodType = activeMethod.getAttribute('data-method');
            
            // Validate based on payment method
            if (methodType === 'credit-card' || methodType === 'mastercard' || methodType === 'amex') {
                // Validate all fields
                if (!validateCardNumber(cardNumberInput)) isValid = false;
                if (!validateCardHolder(cardHolderInput)) isValid = false;
                if (!validateExpiryDate(expiryDateInput)) isValid = false;
                if (!validateCVV(cvvInput, cardNumberInput)) isValid = false;
            } else if (methodType === 'egyptian-visa') {
                // Validate Egyptian Visa fields
                if (!validateCardNumber(egyptianCardNumberInput)) isValid = false;
                if (!validateCardHolder(egyptianCardHolderInput)) isValid = false;
                if (!validateExpiryDate(egyptianExpiryDateInput)) isValid = false;
                if (!validateCVV(egyptianCvvInput, egyptianCardNumberInput)) isValid = false;
            } else if (methodType === 'meza') {
                // Validate Meza fields
                if (!validateCardNumber(mezaCardNumberInput)) isValid = false;
                if (!validateCardHolder(mezaCardHolderInput)) isValid = false;
                if (!validateExpiryDate(mezaExpiryDateInput)) isValid = false;
                if (!validateCVV(mezaCvvInput, mezaCardNumberInput)) isValid = false;
            }
            
            // Validate email
            if (!validateEmail(emailInput)) isValid = false;
            
            if (!isValid) {
                event.preventDefault();
            }
        });
class QuoteLabb {
    constructor() {
        this.features = [];
        this.hourlyRate = 55;
        this.urgentFee = 300;
        this.init();
    }

    init() {
        this.bindEvents();
        this.addFeature(); // Add first feature by default
    }

    bindEvents() {
        document.getElementById('addFeatureBtn').addEventListener('click', () => this.addFeature());
        document.getElementById('urgentToggle').addEventListener('change', (e) => this.updateQuote());
        document.getElementById('exportQuote').addEventListener('click', () => this.exportQuote());

        // Listen for input changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('.feature-name, .feature-hours')) {
                this.updateQuote();
            }
        });
    }

    addFeature() {
        const featureId = Date.now();
        const featureHtml = `
                    <div class="feature-input-group" data-feature-id="${featureId}">
                        <div class="feature-row">
                            <input type="text" class="form-control feature-name" placeholder="Feature name (e.g., User Login)" maxlength="50">
                            <input type="number" class="form-control feature-hours" placeholder="Hours" min="0" max="100" step="0.5">
                            <button type="button" class="btn btn-danger btn-sm remove-feature">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                `;

        document.getElementById('featuresList').insertAdjacentHTML('beforeend', featureHtml);

        // Bind remove event for this specific feature
        const removeBtn = document.querySelector(`[data-feature-id="${featureId}"] .remove-feature`);
        removeBtn.addEventListener('click', () => this.removeFeature(featureId));

        // Auto-focus new input
        const nameInput = document.querySelector(`[data-feature-id="${featureId}"] .feature-name`);
        nameInput.focus();

        this.updateQuote();
    }

    removeFeature(featureId) {
        const featureGroup = document.querySelector(`[data-feature-id="${featureId}"]`);
        if (featureGroup) {
            featureGroup.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                featureGroup.remove();
                this.updateQuote();
            }, 300);
        }
    }

    updateQuote() {
        this.collectFeatures();
        const totalHours = this.features.reduce((sum, f) => sum + (parseFloat(f.hours) || 0), 0);
        const baseCost = totalHours * this.hourlyRate;
        const urgentCost = document.getElementById('urgentToggle').checked ? this.urgentFee : 0;
        const totalCost = Math.round(baseCost + urgentCost);

        // Update displays
        document.getElementById('totalHours').textContent = totalHours.toFixed(1);
        document.getElementById('totalPrice').textContent = `₱${totalCost.toLocaleString()}`;

        // Determine package
        this.updatePackageDisplay(totalCost);
    }

    collectFeatures() {
        this.features = [];
        document.querySelectorAll('.feature-input-group').forEach(group => {
            const name = group.querySelector('.feature-name').value.trim();
            const hours = parseFloat(group.querySelector('.feature-hours').value) || 0;

            if (name || hours > 0) {
                this.features.push({ name, hours });
            }
        });
    }
    updatePackageDisplay(totalCost) {
        const packageDisplay = document.getElementById('packageDisplay');
        let packageName, packageClass;

        if (totalCost >= 1200) {
            packageName = 'Advanced Package (₱1,200 – ₱2,000)';
            packageClass = 'package-advanced';
        } else if (totalCost >= 700) {
            packageName = 'Standard Package (₱700 – ₱1,200)';
            packageClass = 'package-standard';
        } else {
            packageName = 'Basic Package (₱400 – ₱700)';
            packageClass = 'package-basic';
        }

        // Remove previous package classes
        packageDisplay.className = 'package-badge';
        packageDisplay.classList.add(packageClass, 'package-highlight');
        packageDisplay.textContent = packageName;
    }

    // Updated exportQuote method - FULL PAGE PDF LAYOUT:

    exportQuote() {
        const totalHours = parseFloat(document.getElementById('totalHours').textContent);
        const totalCost = parseInt(document.getElementById('totalPrice').textContent.replace(/[₱,]/g, ''));
        const isUrgent = document.getElementById('urgentToggle').checked;
        const packageName = document.getElementById('packageDisplay').textContent;

        let featuresList = '';
        this.features.forEach((feature, index) => {
            if (feature.name && feature.hours > 0) {
                featuresList += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; padding-left: 30px; position: relative; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 5px;">
                <div style="position: absolute; left: 0; color: #0085ff; font-weight: bold; font-size: 1.4rem;">${index + 1}.</div>
                <div style="flex: 1; margin-left: 30px;">
                    <strong style="color: #FFFFFF;">${feature.name}</strong>
                </div>
                <div style="text-align: right; color: #69b4ff;">
                    <div>${feature.hours}h</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">₱${(feature.hours * 55).toLocaleString()}</div>
                </div>
            </div>`;
            }
        });

        const quoteContent = `
<!DOCTYPE html>
<html>

<head>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #FFFFFF;
            color: #000000;
            line-height: 1.6;
            padding: 40px 30px;
            min-height: 100vh;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 2px solid #333333;
        }

        .header h1 {
            font-size: 3rem;
            font-weight: 800;
            color: #000000;
            margin-bottom: 10px;
        }

        .features-section,
        .summary-section,
        .terms-section {
            background: #FFFFFF;
            border: 2px solid #333333;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .section-title {
            color: #000000;
            margin-bottom: 25px;
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            gap: 12px;
            padding-bottom: 12px;
            border-bottom: 2px solid #333333;
        }

        .price-display {
            font-size: 3.5rem;
            font-weight: 800;
            color: #000000;
            text-align: center;
            margin: 25px 0 35px 0;
            border-bottom: 3px solid #333333;
            padding-bottom: 15px;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            font-size: 1.1rem;
            margin-bottom: 25px;
        }

        .summary-grid div {
            padding: 15px;
            background: #f8f8f8;
            border: 1px solid #cccccc;
            border-radius: 6px;
        }

        .signature-section {
            background: #f9f9f9;
            border: 2px dashed #666666;
            border-radius: 8px;
            padding: 35px;
            text-align: center;
            margin-bottom: 30px;
        }

        .signature-line {
            border-bottom: 2px solid #333333;
            height: 50px;
            margin: 25px 0;
            position: relative;
        }

        .signature-label {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #FFFFFF;
            padding: 0 10px;
            font-size: 0.9rem;
            color: #333333;
            font-weight: 600;
        }

        .qr-section {
            display: grid;
            grid-template-columns: 1fr 220px;
            gap: 30px;
            align-items: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #333333;
        }

        .qr-code {
            width: 200px;
            height: 200px;
            background: #000000;
            border-radius: 8px;
            border: 3px solid #333333;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #FFFFFF;
            font-weight: 600;
        }

        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #cccccc;
            font-size: 0.9rem;
            color: #555555;
        }

        /* PDF Print Styles - Each section on its own page, exact web replica */
@media print {
    * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        break-inside: avoid;
    }

    body {
        padding: 20px 15px;
        font-size: 12pt;
        font-family: 'Helvetica', 'Arial', sans-serif;
        line-height: 1.4;
        color: #333;
        background: white;
    }
    
    .container {
        max-width: none;
        width: 100%;
        margin: 0;
        padding: 0;
    }

    /* Force each major section to new page */
    .project-features,
    .quote-summary,
    .terms-conditions,
    .signature-section,
    .header,
    .price-display-section {
        page-break-before: always;
        page-break-inside: avoid;
        page-break-after: avoid;
        margin-bottom: 20px;
        padding: 20px;
        width: 100%;
        max-width: 210mm; /* A4 width */
    }

    /* Header section */
    .header {
        page-break-after: always;
    }
    
    .header h1 {
        font-size: 2.2rem;
        font-weight: bold;
        text-align: center;
        margin-bottom: 10px;
        line-height: 1.2;
    }

    /* Project Features Section */
    .project-features {
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .project-features h2 {
        font-size: 1.5rem;
        color: #2c3e50;
        margin-bottom: 15px;
        border-bottom: 3px solid #3498db;
        padding-bottom: 8px;
    }
    
    .project-features ul {
        list-style: none;
        padding-left: 0;
    }
    
    .project-features li {
        padding: 8px 0;
        border-bottom: 1px solid #e0e0e0;
        font-size: 13pt;
    }

    /* Quote Summary Section */
    .quote-summary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        padding: 30px;
    }
    
    .price-display {
        font-size: 3rem;
        font-weight: 700;
        text-align: center;
        margin: 20px 0;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .summary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 20px;
    }
    
    .summary-item {
        background: rgba(255,255,255,0.2);
        padding: 15px;
        border-radius: 8px;
        text-align: center;
    }

    /* Terms & Conditions */
    .terms-conditions {
        background: #fff3cd;
        border-left: 5px solid #ffc107;
    }
    
    .terms-conditions h2 {
        font-size: 1.5rem;
        color: #856404;
        margin-bottom: 15px;
    }
    
    .terms-conditions ol {
        padding-left: 20px;
        font-size: 11pt;
        line-height: 1.6;
    }
    
    .terms-conditions li {
        margin-bottom: 8px;
    }

    /* Signature Section */
    .signature-section {
        background: #f8f9fa;
        border: 2px dashed #dee2e6;
        padding: 40px;
        text-align: center;
    }
    
    .signature-section h2 {
        font-size: 1.4rem;
        margin-bottom: 30px;
        color: #495057;
    }
    
    .signature-line {
        border-bottom: 2px solid #000;
        height: 50px;
        margin: 20px 0;
        display: flex;
        align-items: center;
        font-style: italic;
        font-size: 12pt;
        padding: 0 20px;
    }

    /* QR Code Section */
    .qr-section {
        display: grid;
        grid-template-columns: 1fr 180px;
        gap: 30px;
        align-items: end;
        margin-top: 30px;
    }
    
    .qr-code {
        width: 160px;
        height: 160px;
        border: 3px solid #3498db;
        border-radius: 12px;
        padding: 10px;
        background: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .qr-label {
        text-align: center;
        font-size: 11pt;
        margin-top: 10px;
        color: #666;
    }

    /* Remove unwanted elements */
    .no-print,
    button,
    .nav,
    footer {
        display: none !important;
    }
    
    /* Ensure full page usage */
    @page {
        size: A4;
        margin: 15mm;
        margin-top: 10mm;
        margin-bottom: 10mm;
    }

    /* Last page adjustments */
    .signature-section:last-child {
        page-break-before: auto;
    }
}

        
        /* Ensure all inline styles use black text */
        p, h1, h2, h3, h4, h5, h6, li, span, strong {
            color: #000000 !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- PROJECT FEATURES -->
        <div class="features-section">
        <p style="font-size: 1.3rem; color: #000000;">Friendly reminder: my code runs better when my wallet does too</p>
            <div class="section-title">
                📋 <strong>Project Features Added</strong>
            </div>
            ${featuresList || '<p style="text-align: center; color: rgba(255,255,255,0.6); font-style: italic; font-size: 1.2rem; margin-top: 40px;">No features added yet</p>'}
        </div>

        <!-- QUOTE SUMMARY -->
        <div class="summary-section">
            <div class="section-title">
                💰 <strong>Quote Summary</strong>
            </div>
            <div class="price-display">₱${totalCost.toLocaleString()}</div>
            <div class="summary-grid">
                <div><strong>Total Hours:</strong><br><span style="font-size: 1.5rem; color: #69b4ff;">${totalHours.toFixed(1)}h</span></div>
                <div><strong>Hourly Rate:</strong><br><span style="font-size: 1.5rem; color: #69b4ff;">₱55/hour</span></div>
                <div><strong>Base Cost:</strong><br><span style="font-size: 1.5rem; color: #69b4ff;">₱${(totalHours * 55).toLocaleString()}</span></div>
                ${isUrgent ? '<div><strong>Urgent Fee:</strong><br><span style="font-size: 1.5rem; color: #ff4757;">₱300</span></div>' : ''}
                <div style="grid-column: 1 / -1; background: rgba(0,133,255,0.2); border: 2px solid rgba(0,133,255,0.4);">
                    <strong>Package:</strong><br>
                    <span style="font-size: 1.4rem; color: #0085ff; font-weight: 700;">${packageName}</span>
                </div>
            </div>
        </div>

   <!-- TERMS & CONDITIONS -->
        <div class="terms-section">
            <div class="section-title">
                📜 <strong>Terms & Conditions</strong>
            </div>
            <ul style="list-style: none; padding: 0;">
                <li style="padding: 16px 0; padding-left: 35px; position: relative; border-bottom: 1px solid #dddddd; font-size: 1.1rem; color: #000000;">
                    <span style="position: absolute; left: 0; color: #0066cc; font-weight: bold; font-size: 1.4rem;">✓</span>
                    30% downpayment required before project start
                </li>
                <li style="padding: 16px 0; padding-left: 35px; position: relative; border-bottom: 1px solid #dddddd; font-size: 1.1rem; color: #000000;">
                    <span style="position: absolute; left: 0; color: #0066cc; font-weight: bold; font-size: 1.4rem;">✓</span>
                    Remaining balance payable upon completion
                </li>
                <li style="padding: 16px 0; padding-left: 35px; position: relative; border-bottom: 1px solid #dddddd; font-size: 1.1rem; color: #000000;">
                    <span style="position: absolute; left: 0; color: #0066cc; font-weight: bold; font-size: 1.4rem;">✓</span>
                    Scope must be finalized before development
                </li>
                <li style="padding: 16px 0; padding-left: 35px; position: relative; border-bottom: 1px solid #dddddd; font-size: 1.1rem; color: #000000;">
                    <span style="position: absolute; left: 0; color: #0066cc; font-weight: bold; font-size: 1.4rem;">✓</span>
                    Urgent request fee applies (+₱300)
                </li>
                <li style="padding: 16px 0; padding-left: 35px; position: relative; border-bottom: 1px solid #dddddd; font-size: 1.1rem; color: #000000;">
                    <span style="position: absolute; left: 0; color: #0066cc; font-weight: bold; font-size: 1.4rem;">✓</span>
                    Extra features quoted separately
                </li>
                <li style="padding: 16px 0; padding-left: 35px; position: relative; border-bottom: 1px solid #dddddd; font-size: 1.1rem; color: #000000;">
                    <span style="position: absolute; left: 0; color: #0066cc; font-weight: bold; font-size: 1.4rem;">✓</span>
                    No long-term maintenance unless agreed
                </li>
                <li style="padding: 16px 0; padding-left: 35px; position: relative; font-size: 1.1rem; color: #000000;">
                    <span style="position: absolute; left: 0; color: #0066cc; font-weight: bold; font-size: 1.4rem;">✓</span>
                    Revisions limited to 1-2 minor changes
                </li>
            </ul>
        </div>

        <!-- SIGNATURE SECTION -->
        <div class="signature-section">
            <h3 style="color: #000000; margin-bottom: 25px; font-size: 1.4rem;">Customer Approval</h3>
            <div class="signature-line"></div>
            <p style="color: #000000; font-size: 1.1rem; margin-bottom: 8px;">Customer Signature</p>
            <div class="signature-line"></div>
            <p style="color: #000000; font-size: 1.1rem; margin-bottom: 8px;">Date</p>
            <p style="color: #333333; font-size: 0.95rem;">I approve this quotation and agree to the terms above</p>
        </div>

        <!-- QR CODE PAYMENT -->
        <div class="qr-section">
            <div>
                <h4 style="color: #000000; margin-bottom: 12px;">Ready to Start?</h4>
                <p style="font-size: 1.1rem; margin-bottom: 8px; color: #000000;">Scan QR Code to pay <strong>30% downpayment</strong></p>
                <p style="color: #cc0000; font-weight: 600; font-size: 1.2rem;">₱${Math.round(totalCost * 0.3).toLocaleString()}</p>
            </div>
            <div class="qr-code">sub0image<br><small>GCash QR</small></div>
        </div>

        <div class="footer">
            <p>Generated on: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</p>
            <p style="color: #555555;">Once payment is confirmed, I suddenly become very productive.</p>
        </div>
    </div>
</body>

</html>    `;

        // PDF Generation Options
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `QuoteLabb_Estimate_${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                allowTaint: true
            },
            jsPDF: {
                unit: 'in',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(quoteContent).save();
    }
}

// Input validation
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('feature-hours')) {
        const value = parseFloat(e.target.value);
        if (value < 0) {
            e.target.value = 0;
        } else if (value > 100) {
            e.target.value = 100;
        }

        // Only allow numbers and one decimal place
        e.target.value = value.toFixed(1);
    }

    if (e.target.classList.contains('feature-name')) {
        // Limit length and remove special characters
        e.target.value = e.target.value.slice(0, 50).replace(/[^\w\s-]/g, '');
    }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuoteLabb();
});

// Add CSS for fade out animation
const style = document.createElement('style');
style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
document.head.appendChild(style);
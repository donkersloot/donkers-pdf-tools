document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    const statusDiv = document.getElementById('status');

    // Tab Switching Logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.tab);
            target.classList.add('active');
            statusDiv.textContent = ''; // Clear status on tab switch
        });
    });

    // Form Handling
    const handleFormSubmit = async (formId, endpoint) => {
        const form = document.getElementById(formId);
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Processing...';
                statusDiv.textContent = 'Uploading and processing...';
                statusDiv.style.color = 'var(--text-muted)';

                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                // Trigger download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `processed_${Date.now()}.pdf`; // The server sends a filename, but we can override or extract it if needed.
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();

                statusDiv.textContent = 'Success! File downloaded.';
                statusDiv.style.color = 'green';
                form.reset();
            } catch (error) {
                console.error(error);
                statusDiv.textContent = `Error: ${error.message}`;
                statusDiv.style.color = 'red';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    };

    handleFormSubmit('mergeForm', '/api/merge');
    handleFormSubmit('reverseForm', '/api/reverse');
    handleFormSubmit('altMergeForm', '/api/alt-merge');
});

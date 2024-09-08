// Add any JavaScript functionality here if needed
document.addEventListener('DOMContentLoaded', function() {
    // Example: Add click event to download buttons
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', function() {
            alert('Download link clicked!');
        });
    });
});

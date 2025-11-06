// Highlight active nav links
document.querySelectorAll('nav ul li a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('nav ul li a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Loading overlay functions
function showLoading() { document.getElementById('loading').style.display='flex'; }
function hideLoading() { document.getElementById('loading').style.display='none'; }

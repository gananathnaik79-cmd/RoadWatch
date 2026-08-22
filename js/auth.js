// RoadWatch Authentication

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

async function requireAuth() {
  const session = await checkAuth();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  
  const userEmail = document.getElementById('userEmail');
  if (userEmail && session.user) {
    userEmail.textContent = session.user.email;
  }
  
  return session;
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}

function toggleMobileMenu() {
  const menu = document.getElementById('navMenu');
  if (menu) menu.classList.toggle('active');
}
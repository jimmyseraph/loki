export function clearUserInfo() {
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  localStorage.removeItem('id');
  localStorage.removeItem('email');
  localStorage.removeItem('mobile');
}

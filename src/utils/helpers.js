export const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

export const initials = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export const todayStr = () => new Date().toISOString().slice(0, 10);

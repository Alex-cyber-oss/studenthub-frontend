// src/api.js
import { queueRequest } from './db';

export const postData = async (endpoint, data) => {
  const url = `https://alexmoi.alwaysdata.net/api/${endpoint}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  } catch (err) {
    await queueRequest(url, 'POST', data);
    // Enregistre le sync...
    return { status: 'offline' };
  }
};

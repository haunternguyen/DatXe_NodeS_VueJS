import io from 'socket.io-client';

const BASE_URL = 'http://localhost:5858';

export const EVENT_REQUESTS_CHANGED = 'identifier-requests-change';
export const EVENT_INIT_IDENTIFIER = 'init-identifier-info';

export function connect() {
  const socket = io(BASE_URL);
  return socket;
}

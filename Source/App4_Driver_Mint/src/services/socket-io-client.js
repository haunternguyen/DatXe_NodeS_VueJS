import io from 'socket.io-client';

const BASE_URL = 'http://localhost:5858';

export function connect() {
  const socket = io(BASE_URL);
  return socket;
}

export const SOCKET_EVENTS = {
  driverLocationChange: 'driver-location-change'
};

export function getEventDriverLocationChange(userId) {
	return `${userId}-driver-location-change`;
}

export function getEventDriverNewFitRequest(userId) {
	return `${userId}-driver-new-fit-request`;
}


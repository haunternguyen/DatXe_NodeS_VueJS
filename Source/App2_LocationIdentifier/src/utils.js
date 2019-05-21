import { REQUEST_STATUS } from './constants';

export function statusToText(status) {
  switch (status) {
    case REQUEST_STATUS.DONE:
      return 'Đã hoàn thành';
    case REQUEST_STATUS.GEOCODED:
      return 'Đã định vị';
    case REQUEST_STATUS.MOVING:
      return 'Trên đường';
    case REQUEST_STATUS.PICKED:
      return 'Đang đón';
    case REQUEST_STATUS.RECEIVED:
      return 'Chưa định vị';
    case REQUEST_STATUS.NO_DRIVER:
      return 'Không tìm thấy xe';
  }
}

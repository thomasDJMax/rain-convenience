// 场景尺寸与布局（单位：米）。整块底座 24 x 24。
export const HALF = 12;
export const BASE_TOP = 0;
export const SIDEWALK_Y = 0.12;

export const ROAD = {
  mainZ0: 6.4,
  mainZ1: 10.8,
  sideX0: 6.2,
  sideX1: 10.8,
};

export const STORE = {
  x0: -6.2,
  x1: 4.2,
  z0: -4.2,
  z1: 3.4,
  floor: 0.2,
  ceil: 2.98,
  glassBottom: 0.5,
  glassTop: 2.86,
  headerY: 3.16,
  h: 4.3,
  doorX0: 1.4,
  doorX1: 3.0,
  winX0: -5.9,
  winX1: 0.9,
};

export const NEIGHBOR = {
  x0: -11.6,
  x1: -8.4,
  z0: -7.6,
  z1: 3.4,
  h: 7.3,
};

export const ALLEY = {
  x0: -8.4,
  x1: -6.2,
  z0: -7.6,
  z1: 3.4,
};

export const BACK_ROW = {
  z0: -11.6,
  z1: -8.4,
};

export const WALK = {
  frontZ0: 3.4,
  frontZ1: 6.4,
  rightX0: 4.2,
  rightX1: 6.2,
  farZ0: 10.8,
  farX0: 10.8,
};

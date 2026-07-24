const pad = (value: number) => String(value).padStart(3, "0");

export const dateCode = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const sessionCode = (countForDay: number, date = new Date()) => {
  return `UNLOAD-${dateCode(date)}-${pad(countForDay + 1)}`;
};

export const cubeCode = (countForSession: number) => {
  return `CUBE-${pad(countForSession + 1)}`;
};

export const actionCode = (countForSession: number) => {
  return `ACTION-${pad(countForSession + 1)}`;
};

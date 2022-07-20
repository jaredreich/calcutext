import { v4 as uuidv4 } from 'uuid';

export default null;

export const createNewText = () => ({
  id: uuidv4(),
  data: {
    body: '',
    title: '',
  },
});

export const debounce = (func) => {
  let timer;
  return (event) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, 100, event);
  };
};

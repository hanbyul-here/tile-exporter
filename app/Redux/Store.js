import { createStore } from 'redux';
import reducer from './Reducer';

const store = createStore(reducer);

module.exports = store;

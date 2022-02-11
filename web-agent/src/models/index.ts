import { history, Effect, ImmerReducer, Reducer, Subscription } from 'umi';
import store from 'store'; 

export interface IndexModelState {
  username: string;
}

export interface IndexModelType {
  namespace: 'global';
  state: IndexModelState;
  effects: {
    storeUser: Effect;
    removeStore: Effect;
    storeMenuList: Effect;
  };
  reducers: {
    save: Reducer<IndexModelState>;
    // 启用 immer 之后
    // save: ImmerReducer<IndexModelState>;
  };
  subscriptions: { setup: Subscription };
}

const IndexModel: IndexModelType = {
  namespace: 'global',

  state: {
    username: '',
  },

  effects: {
    *storeUser({ payload }, { call, put, select }) {
      //dispatch请求的方法
      store.set('user', payload);
      history.push('/index');
      // console.log(payload);
      // const { dataList } = yield select((state) => state.system); //获取models中的state
      // const { data } = yield call(services.testFunc, params);  //call,请求services里面的接口以及传参，可继续往后面加参数，跟JavaScript的call一样
      // if (data && data.code == 0) {
      //   const data_ = data.data.content;
      //   yield put({ //put,必须发出action save，此action被reducer监听，从而达到更新state数据的目的
      //     type: 'save',
      //     payload: {
      //       dataList: data_ || []
      //     }
      //   });
      //   return data_;                                          //返回response，可选
      // }
    },
    *storeMenuList({ menuList }, { call, put, select }) {
      //dispatch请求的方法
      store.set('menuList', menuList);
    },
    *removeStore({ payload }, { call, put, select }) {
      // store.remove('menuList');
      // store.remove('user');
      store.clearAll();
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // 启用 immer 之后
    // save(state, action) {
    //   state.name = action.payload;
    // },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/') {
          // dispatch({
          //   type: 'storeUser',
          // });
        }
      });
    },
  },
};

export default IndexModel;

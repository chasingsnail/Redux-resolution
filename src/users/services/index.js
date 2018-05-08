import Rx from "rxjs";
import Ajax from "api";

export const tableAjax = (action, store) => {
  return Rx.Observable.fromPromise(
    Ajax(
      {
        pageSize: 10,
        startIndex: 0
      },
      "nfunder/list"
    )
  );
};

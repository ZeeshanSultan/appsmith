import { ReduxActionTypes, ReduxAction } from "constants/ReduxActionConstants";
import { ENTITY_TYPE } from "entities/DataTree/dataTreeFactory";
import { Action } from "entities/Action";

export const createQueryRequest = (payload: Partial<Action>) => {
  return {
    type: ReduxActionTypes.CREATE_QUERY_INIT,
    payload,
  };
};

export const initQueryPane = (
  pluginType: string,
  urlId?: string,
): ReduxAction<{ pluginType: string; id?: string }> => {
  return {
    type: ReduxActionTypes.INIT_QUERY_PANE,
    payload: { id: urlId, pluginType },
  };
};

export const changeQuery = (
  id: string,
  newQuery?: boolean,
  action?: Action,
): ReduxAction<{ id: string; newQuery?: boolean; action?: any }> => {
  return {
    type: ReduxActionTypes.QUERY_PANE_CHANGE,
    payload: { id, newQuery, action },
  };
};

/**
 * This action when executed updates the status of isSaving query to true for an actionId.
 * This function was created to add a sync to the text updated in the editor and shortcut command fired to execute the query.
 *
 * @param {ReduxAction} payload Contains object having id of the action and type indicating that it is an action.
 */

export const startingEntityUpdation = (
  payload: ReduxAction<{ id: string; type: string }>,
) => {
  if (payload.type === ENTITY_TYPE.ACTION) {
    return {
      type: ReduxActionTypes.ENTITY_UPDATE_STARTED,
      payload: payload,
    };
  }
};

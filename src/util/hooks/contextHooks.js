import { useContext, useEffect } from "react";
import { AppContext, defaultSelection } from "../../state/context"
import { fetchData, fetchFeatures } from "../../api/data";
import { fetchSelectionUsers } from "../../api/selections";
import { fetchNotebook, fetchNotebookUsers, postNotebook } from "../../api/notebook";

// `error` is used by a site-wide Snackbar component
// when this value is truthy, a red error snackbar is displayed with the contents
export const useError = () => {
    const { state: { error }, dispatch } = useContext(AppContext)
    const setError = (err) => dispatch({ type: 'ERROR', payload: err })
    return [error, setError]
}

// get current user's feature selections
export const useFeatureSelection = () => {
    const { state, dispatch } = useContext(AppContext)
    const select = (feature, { decision, sure, reason }) => {
        const currentSelection = state.featureSelections[feature]
        return dispatch({ type: 'FEATURE_SELECT', payload: { feature, selection: {
            decision: decision ?? currentSelection.decision,
            sure: sure ?? currentSelection.sure ?? true,
            reason: reason ?? currentSelection.reason ?? '',
        }}})
    }
        
    return [state.featureSelections, select]
}

// get participant id
export const useId = () => {
    const { state: { id }, dispatch } = useContext(AppContext)
    const setId = (id) => dispatch({ type: 'PARTICIPANT_ID', payload: id})
    return [id, setId]
}

// get feature data (fetched from server's .csv file)
export const useData = () => {
    const { state, dispatch } = useContext(AppContext)
    const { data: { rows, features, target, ids }, dataLoading } = state
    const [_,setError] = useError()
    const [selections] = useFeatureSelection()

    useEffect(() => {
        if (rows === -1 && !dataLoading){
            // set loading to true, don't change `data`
            dispatch({ type: 'FETCH_DATA', payload: { loading: true }})
            fetchData()
            .then(data => {
                dispatch({ type: 'FETCH_DATA', payload: { loading: false, data, setDefaultSelections: !Boolean(selections) }})
            })
            .catch((err) => {
                setError(err.message)
                dispatch({ type: 'FETCH_DATA', payload: { loading: false }})
            })
        }
    },[])

    return { rows, features, target, ids, dataLoading }
}

export const useNotebook = () => {
    const { state, dispatch } = useContext(AppContext)
    const { notebook } = state
    const [_,setError] = useError()
    const [id] = useId()

    const setNotebook = (notebookData) => dispatch({ type: 'NOTEBOOK', payload: {...notebookData, id}})

    const submitNotebook = (notebookData) => 
        postNotebook(id, notebookData)
        .then(() => {
            setNotebook({...notebookData, status: 'full'})
            return true
        })
        .catch(err => {
            setError(err)
            return false
        })
    

    useEffect(() => {
        if (id && (notebook.status === 'not loaded' || id !== notebook.id)){
            dispatch({ type: 'NOTEBOOK', payload: { status: 'loading' }})
            fetchNotebook(id)
            .then(data => {
                const status = data ? 'full' : 'empty'
                setNotebook({...data, status})
            })
            .catch(err => {
                setError(err)
                dispatch({ type: 'NOTEBOOK', payload: { status: 'empty' }})
            })
        }
    }, [id])

    return [notebook, submitNotebook]
}

export const useSelectionsUsers = () => {
    const { state: { selectionsUsers }, dispatch } = useContext(AppContext)
    const [_,setError] = useError()

    // const clear = () => dispatch({ type: 'FETCH_SELECTIONS_USERS', payload: []})

    useEffect(() => {
        if (!selectionsUsers){
            fetchSelectionUsers()
            .then(users => {
                dispatch({ type: 'FETCH_SELECTIONS_USERS', payload: users})
            })
            .catch(err => setError(err.message))
        }
    },[])

    // return [selectionsUsers ?? [],clear]
    return selectionsUsers ?? []
}

export const useFeatures = () => {
    const { state: { features }, dispatch } = useContext(AppContext)
    const [_,setError] = useError()


    useEffect(() => {
        if (!features){
            fetchFeatures()
            .then(feats => {
                dispatch({ type: 'FETCH_FEATURES', payload: feats})
            })
            .catch(err => setError(err.message))
        }
    },[])

    return features ?? []
}

export const useNotebookUsers = () => {
    const { state: { notebookUsers }, dispatch } = useContext(AppContext)
    const [_,setError] = useError()

    useEffect(() => {
        if (!notebookUsers){
            fetchNotebookUsers()
            .then(users => {
                dispatch({ type: 'FETCH_NOTEBOOK_USERS', payload: users})
            })
            .catch(err => setError(err.message))
        }
    },[])

    return notebookUsers ?? []
}
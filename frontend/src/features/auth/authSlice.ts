import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
    name:'auth',
    initialState:{
        access_token:null,
        refresh_token:null
    }, 
    reducers:{
        setUserTokens: (state, action) =>{
            state.access_token = action.payload.access_token
            state.refresh_token = action.payload.refresh_token
        },

        unsetUserTokens: (state, action) =>{
            state.access_token = null
            state.refresh_token = null
        }
    }

})

// Action creators are generated for each case reducer function
export const { setUserTokens, unsetUserTokens } = authSlice.actions

export default authSlice.reducer
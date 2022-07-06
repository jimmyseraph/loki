export const api = {
    // user
    login: {
        path: '/api/user/login',
        method: 'post',
    },

    logout: {
        path: '/api/user/logout',
        method: 'get',
    },

    getScriptList: {
        path: '/api/script/list',
        method: 'get',
    },

    getScriptDetail: {
        path: '/api/script/detail',
        method: 'get',
    },

    saveScript: {
        path: '/api/script/save',
        method: 'post',
    },

    removeScript: {
        path: '/api/script/remove',
        method: 'get',
    },

    getReportList: {
        path: '/api/report/list',
        method: 'get',
    },

    getReportInfo: {
        path: '/api/report/info',
        method: 'get',
    },

    getReportStatistics: {
        path: '/api/report/statistics',
        method: 'get',
    },

    startPilot: {
        path: '/api/pilot/start',
        method: 'post',
    },

    getAgentList: {
        path: '/api/agent/list',
        method: 'get',
    },

    getReportCharts: {
        path: '/api/report/charts',
        method: 'get',
    },

}
const ENV: string = import.meta.env.MODE
const ENVconfig: interConfig = {
    dev: {
        baseApi: '/api',
        mockApi: '/examples',
    },
    test: {
        baseApi: '/testapi',
        mockApi: 'https://www.fastmock.site/mock/ec99e520faf1c6733364883e6ea32098/api'
    },
    production: {
        baseApi: '/api'
    }
}
export default {
    ENV,
    mock: true,
    ...ENVconfig[ENV]
}
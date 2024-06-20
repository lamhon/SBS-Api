const Config = {
    VERSION: 'v1',
    PORT: 3001,
    //---------------------------
    RES_STT_SUCCESS: 'success',
    RES_STT_FAILED: 'failed',
    //---------------------------
    RES_CODE_SUCCESS_OK: 200,
    RES_CODE_ERR_EXTERNAL: 500,
    RES_CODE_ERR_BAD_RQ: 400,
    RES_CODE_ERR_UNAUTHORIZED: 401,
    //---------------------------
    ERROR_CODE_QUERY_FAILED: 'E-0001',
    ERROR_CODE_GENERATE_ACCESSTOKEN: 'E-0002',
    ERROR_CODE_GENERATE_REFRESHTOKEN: 'E-0003',
    ERROR_CODE_GET_EXPIRATION_DATE_TOKEN: 'E-0004',
    ERROR_CODE_UPDATE_REFRESHTOKEN_TO_DB: 'E-0005',
    //---------------------------
    USERNAME_MAX_LENGTH: 60,
    USERNAME_MIN_LENGTH: 4,
    PWD_MAX_LENGTH: 120,
    PWD_MIN_LENGTH: 8,
    FULLNAME_MAX_LENGTH: 120,
    FULLNAME_MIN_LENGTH: 2,
    AVATAR_MAX_LENGTH: 200,
    PHONE_MAX_LENGTH: 12,
    IDENTIFICATION_LENGTH: 12,
    EMAIL_MAX_LENGTH: 120,
    ADDRESS_MAX_LENGTH: 120,
    //---------------------------
    TYPE_ACTIVE: '00',
    //---------------------------
    FORMAT_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9^$*.\[\]{}()?\-\"!@#%&\/\\,><':;|_~`+]{8,64}$/,

}

Object.freeze(Config)

export default Config

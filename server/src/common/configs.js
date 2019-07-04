var configs = {}

configs.CRYPTOKEY = "fdaREARFDASvzcvcxkjlcv!@#@!$dsafj;ldklasAFDADF";
configs.FACEBOOK_PASSWORD = "empty_password";
configs.ROOT_FOLDER = 'uploads/';
configs.CONTENTS_FOLDER = "resources/";
configs.PROFILE_FOLDER = "member/";
configs.TEMP_FOLDER = "temp/";
configs.BASIC_PROFILE = configs.PROFILE_FOLDER + 'basic.jpg';
configs.FILE_LIMIT = 20971520
configs.SCORE_LIMIT = 0.85
configs.POSTS_PER_PAGE = 3
configs.POSTS_PER_USER = 10
configs.CHECK_POST = 10
configs.CHECK_MEMBER = 10
configs.RECOMMEND_SIM_N = 5 // 최상위 N 유사도를 가지는 회원
configs.RECOMMEND_POST_N = 30 // 추천 게시물 개수
configs.HOT_POST_N = 30 // 추천 게시물 개수
configs.RECOMMEND_TOP_N = 5 // 상위 N개의 태그 빈도를 나타내는 변수

module.exports = configs;
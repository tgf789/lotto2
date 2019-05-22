# -*- coding: utf-8 -*-  
# 인코딩 설정 

from flask import Flask     # 웹서버 구축 플라스크
import psycopg2             # DB연결
import psycopg2.extras      # 쿼리 결과를 dict형으로 변환하기 위함
from flask_restful import Resource, Api # 플라스크 API형
from flask_restful import reqparse      # url 파라미터 수집
from werkzeug.routing import BaseConverter  # url에서 정규식 사용
from flask_cors import CORS # CORS 이슈


import json

class RegexConverter(BaseConverter):        # URL 내에 있는 정규식 치환
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]

app = Flask(__name__)                       # flask

app.url_map.converters['regex'] = RegexConverter    # 정규식 적용
cors = CORS(app, resources={r"/*": {"origins": "*"}})   # CORS 이슈

api = Api(app)

#============================================

class DBConn():         # DB 연결
    def __init__(self):     # 생성자
        connString = "host='localhost' dbname='tgf789' user='tgf789' password='1234'"
        self.conn = psycopg2.connect(connString)
        self.cur = self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor)  # 딕셔너리 모드

    def select(self,query, data = []):      # row가 2개 이상 결과인 셀렉트
        self.cur.execute(query,data)
        return self.cur.fetchall()          # 여러개 인출

    def selectOne(self,query, data = []):   # row가 1개인 셀렉트
        self.cur.execute(query,data)
        return self.cur.fetchone()          # 한개 인출

    def close(self):
        self.conn.close()

def requestArgs(args):                      # URL 파라미터 가져오기 args = ['order','by']
    parser = reqparse.RequestParser()
    for arg in args :
        parser.add_argument(arg)
    return parser.parse_args()

#============================================

class GetRankingItems(Resource):            # 각종 랭킹 아이템 만들기
    def get(self):                          # Method GET
        try:
            db = DBConn()

            result = []
            resultRaw = db.selectOne("select * from lotto order by winners_amount desc limit 1;")
            result.append({'title' : "역대 최고 1등 당첨금은?", 'answer' : format(int(resultRaw['winners_amount']),',')+"원", 'subAnswer' : str(resultRaw['episode_no'])+"회"})

            resultRaw = db.selectOne("select * from lotto order by winners_co desc limit 1;")
            result.append({'title' : "1등 당첨자가 가장 많았던 회차?", 'answer' : str(resultRaw['episode_no'])+"명", 'subAnswer' : str(resultRaw['winners_co'])+"명"})

            resultRaw = db.selectOne("select * from lotto order by winner_amount_one desc limit 1;")
            result.append({'title' : "역대 최고 1인 당첨금은?", 'answer' : format(int(resultRaw['winner_amount_one']),',')+"원", 'subAnswer' : str(resultRaw['episode_no'])+"회"})
            
            return {'result' : 'success', 'responseData' : result}
        except Exception as e :
            return {'result' : 'error', 'errorBody' : str(e)}

class GetCurrentLotto(Resource):            # 해당하는 회차 결과 가져오기. 빈값이면 가장 최근꺼
    def get(self,epNo):
        try:
            db = DBConn()
            if not epNo or epNo == "0" :    # 빈값이면 최근꺼
                where = ''
            else : 
                where = ' where episode_no='+epNo 
            result = db.selectOne("select episode_no,winners_amount,winner_amount_one,winners_co,episode_date :: char(10),no1,no2,no3,no4,no5,no6,no7 from lotto "+
            where +
            "order by episode_no desc limit 1")
            
            return {'result' : 'success' , 'responseData' : dict(result)}
        except Exception as e:
            return {'result': 'error', 'errorBody' : str(e)}

class GetLottoNoHistory(Resource):          # 가장 많이 나온 숫자 순대로 정렬하기
    def get(self):
        try:
            args = requestArgs(['order','by'])
            db = DBConn()
            if not args['order'] or not args['by'] :
                raise Exception("have not arguments")
            if args['order'] != "no" and args['order'] != "cnt" :
                raise Exception("argument order can have only no,cnt")
            if args['by'] != "asc" and args['by'] != "desc" :
                raise Exception("argument by can have only asc,desc")

            result = db.select("Select no,(sum(cnt) :: integer) as cnt from (" +
            "select no1 as no,count(no1) as cnt from lotto group by no1 UNION ALL " +
            "select no2 as no,count(no2) as cnt from lotto group by no2 UNION ALL " +
            "select no3 as no,count(no3) as cnt from lotto group by no3 UNION ALL " +
            "select no4 as no,count(no4) as cnt from lotto group by no4 UNION ALL " +
            "select no5 as no,count(no5) as cnt from lotto group by no5 UNION ALL " +
            "select no6 as no,count(no6) as cnt from lotto group by no6 UNION ALL " +
            "select no7 as no,count(no7) as cnt from lotto group by no7) as n " +
            "group by no order by "+args['order']+" "+args['by'])
            
            return {'result' : 'success', 'responseData' : result}
        except Exception as e:
            return {'result': 'error', 'errorBody' : str(e)}
        finally :
            db.conn.close()


api.add_resource(GetRankingItems, '/getRankingItems')           # path 추가
api.add_resource(GetLottoNoHistory, '/getLottoNoHistory')
api.add_resource(GetCurrentLotto, '/<regex("[0-9]*"):epNo>')    # [0-9] 형태의 0개 이상을 epNo에 담기



# if __name__ == '__main__':
app.run(host="10.41.15.152", port="5000", debug=True, use_reloader=False)

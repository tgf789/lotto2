import requests
import psycopg2
import time

def get_request_by_episode(episode):
    params = {
        'method': 'getLottoNumber',
        'drwNo': episode
    }
    # verify=False SSL 무시
    req = requests.get('https://www.nlotto.co.kr/common.do', params=params, verify=False)
    result = req.json()
    return result

connString = "host='localhost' dbname='tgf789' user='tgf789' "
conn = psycopg2.connect(connString)
cur = conn.cursor()


cur.execute('select episode_no from lotto order by episode_no desc limit 1')
recentNo = cur.fetchone()

for i in range(recentNo[0],recentNo[0]+10) :
    time.sleep(1)
    print ("---"+str(i)+"....\n")
    result = get_request_by_episode(i)
    print(result)
    if result['returnValue'] == "fail" :
        print ("============="+str(i)+" 번째에서 FAIL==============")
        break
    
    data = [result['drwNo'],result['drwNoDate'],result['firstAccumamnt'],result['firstWinamnt'],result['firstPrzwnerCo'],result['drwtNo1'],result['drwtNo2'],result['drwtNo3'],result['drwtNo4'],result['drwtNo5'],result['drwtNo6'],result['bnusNo']]
    cur.execute('insert into lotto'+
'(episode_no,episode_date,winners_amount,winner_amount_one,winners_co,no1,no2,no3,no4,no5,no6,no7) '+
'values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',data)

conn.commit()
conn.close()
print('종료')


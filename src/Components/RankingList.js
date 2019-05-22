import React,{Component} from 'react'
import axios from 'axios'



export default class RankingList extends Component{
    constructor(props){
        super(props)
        this.state = {
            rankingList: []
        }

    }

    componentDidMount(){
        console.log('...')
        this.callRankingItems();
    }

    callRankingItems = () => {
        axios.get('http://49.236.137.107:5001/getRankingItems')
        .then((response) => {
            if(response.status !== 200) throw Error(response.status + ' Error')
            if(response.data.result !== 'success') Error('data error')
            if(!response.data.responseData[0]) Error('DB data Error')
            
            const {responseData} = response.data

            this.setState({
                rankingList : responseData
            })

            if(this.state.maxEpNo === -1) this.setState({maxEpNo : responseData['episode_no']})
        })
        .catch(function (error) {
            console.log(error);
        });
    }



    render(){
        const {rankingList} = this.state
        return(
            <div className="cc">
                <ul className="rankingList">
                {rankingList.map((item,index) => 
                    <li key={`rk_${index}`}>
                        <h3 className="rkTitle">{item['title']}</h3>
                        <hr/>
                        <div className="rkAnswerField">
                            <div>{item['answer']}</div>
                            <div>{item['subAnswer']}</div>

                        </div>
                    </li>)}
                </ul>
            </div>
        )
    }
}
import React,{ useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import axios from "axios"
import jwt_decode from "jwt-decode"
import { useLocation, useParams, useNavigate } from "react-router-dom"
import { 
    AiFillLike,
    AiOutlineLike,
    AiFillDislike,
    AiOutlineDislike 
} from "react-icons/ai"
import {
    MdAccessTime,
    MdPlaylistAdd
} from "react-icons/md"
import YouTube from "react-youtube";
import './VideoPage.css'
import {
    RecommendationCard,
    AddToPlaylistModal,
    useTrendingVideos,
    useDislikedVideos,
    useToast,
    useHistory
} from '../../index'

function VideoPage() {
    const { showToast } = useToast()
    const { userHistoryList, setUserHistoryList } = useHistory()

    const [ videoLikedStatus, setVideoLikedStatus ] = useState("neutral")
    const [ isVideoPresentInWatchLater, setIsVideoPresentInWatchLater ] = useState(false)
    const [ showPlaylistModal, setShowPlaylistModal ] = useState(false)

    const { trendingVideosList } = useTrendingVideos()

    window.YTConfig = {
      host: 'https://www.youtube.com' 
    } 

    const navigate = useNavigate()
    const { pathname, state } = useLocation();

    let video = state.videoDetails
    const {
        videoSrcUrl,
        title,
        views
    } = video

    let videoViews;

    if(views>1000000)
    {
        videoViews = (views/1000000).toFixed(1) + "M"
    }
    else
    {
        if(views>1000)
        {
            videoViews = (views/1000).toFixed(1) + "K"
        }
        else
        {
            videoViews = views + ""
        }
    }

    let videoCode;
    if (videoSrcUrl) {
        videoCode = videoSrcUrl.split("v=")[1].split("&")[0];
    }

    const opts = {
        playerVars: {
        autoplay: 1
        }
    };
    
    useEffect(()=>{
        

        

        

        
        (async () => {
            const token=localStorage.getItem('token')

            if(token)
            {    
                const user = jwt_decode(token)
                    
                if(user)
                {
                    const updatedUserInfo = await axios.patch(
                        "https://Videoztron-server.vercel.app/api/history",
                        {
                            video
                        },
                        {
                            headers : {'x-access-token': localStorage.getItem('token')} 
                        }
                    )

                    if(updatedUserInfo.data.status==="ok")
                    {
                        setUserHistoryList(updatedUserInfo.data.user.history)
                    }
                }
            }
        })()

    },[ video._id])

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const addToLikedVideos = async () => {
        const token=localStorage.getItem('token')

        if(token)
        {
            const user = jwt_decode(token)
                
            if(!user)
            {
                localStorage.removeItem('token')
                showToast("warning","","Kindly Login")
                navigate('/login')
            }
            else
            {
                if(videoLikedStatus==="liked")
                {
                    // Item already present in liked videos list, remove like
                    let updatedUserInfo = await axios.delete(
                        `https://Videoztron-server.vercel.app/api/likedvideos/${video._id}`,
                        {
                            headers:
                            {
                                'x-access-token': localStorage.getItem('token'),
                            }
                        },
                        {
                            video
                        }
                    )
                        
                    if(updatedUserInfo.data.status==="ok")
                    {
                       setVideoLikedStatus("neutral")
                        showToast("success","","Video Like removed")
                    }
                }
                else
                {
                    // Item not present in liked videos
                    // Update in backend and then in frontend
                    let updatedUserInfo = await axios.patch(
                        "https://Videoztron-server.vercel.app/api/likedvideos",
                        {
                            video
                        },
                        {
                            headers:
                            {
                                'x-access-token': localStorage.getItem('token'),
                            }
                        }
                    )

                    //Remove from liked videos list, if it exists in it
                    // const dislikedVideoIndex = dislikedVideosList.findIndex(videoDetails=> {
                    //     return videoDetails._id === video._id
                    // })
            
                    

                    if(updatedUserInfo.data.status==="ok")
                    {
                        setVideoLikedStatus("liked")
                        let newTitle = title
                        if(title.length>10)
                        {
                            newTitle = title.split('').slice(0,10).join('') + "..."
                            console.log(newTitle)
                        }
                        let likedVideoMessage = "Video liked " + newTitle
                        showToast("success","",likedVideoMessage)
                    }
                }
            }
        }
        else
        {
            showToast("warning","","Kindly Login")
        }
    }

    const removeFromLikedVideos = async () => {
        const token=localStorage.getItem('token')

        if(token)
        {
            const user = jwt_decode(token)
                
            if(!user)
            {
                localStorage.removeItem('token')
                showToast("warning","","Kindly Login")
                navigate('/login')
            }
            else
            {
                if(videoLikedStatus==="disliked")
                {
                    let updatedUserInfo = await axios.delete(
                        `https://Videoztron-server.vercel.app/api/dislikedvideos/${video._id}`,
                        {
                            headers:
                            {
                                'x-access-token': localStorage.getItem('token'),
                            }
                        },
                        {
                            video
                        }
                    )

                    
                    setVideoLikedStatus("neutral")
                    showToast("success","","Video Dislike removed")
                }
                else
                {
                
                    //Add to disliked videos list
                    let updatedUserInfo = await axios.patch(
                        "https://Videoztron-server.vercel.app/api/dislikedvideos",
                        {
                            video
                        },
                        {
                            headers:
                            {
                                'x-access-token': localStorage.getItem('token'),
                            }
                        }
                    )

                    //Remove from liked videos list, if it exists in it
                    // const likedVideoIndex = likedVideosList.findIndex(videoDetails=> {
                    //     return videoDetails._id === video._id
                    // })
            
                    
                        
                    if(updatedUserInfo.data.status==="ok")
                    {
                        setVideoLikedStatus("disliked")
                        showToast("success","","Video disliked")
                    }
                }   
            }
        }
        else
        {
            showToast("warning","","Kindly Login")
        }
    }

    

    

    return (
        <div className='video-page-container'>
            <div className='video-content-container'>
                <div className='youtube-video-container'>
                    <YouTube
                        videoId={videoCode}
                        containerClassName="embed embed-youtube"
                        className="youtube-video"
                        opts={opts}
                    />
                </div>
                <h3 className='video-title'>{title}</h3>
                <div className='video-info-and-options'>
                    <div className='video-info'>
                        <span>{videoViews} &#183; 13 hours ago</span>
                    </div>
                    <div className='video-options-container'>
                        {
                            videoLikedStatus==="liked" 
                            ? (
                                <div 
                                    className='video-options'
                                    onClick={()=>addToLikedVideos()}
                                >
                                    <AiFillLike className='options-icon'/>
                                    <span>Like</span>
                                </div>
                            ) : (
                                <div 
                                    className='video-options'
                                    onClick={()=>addToLikedVideos()}
                                >
                                    <AiOutlineLike className='options-icon'/>
                                    <span>Like</span>
                                </div>
                            )
                        }
                        {
                            videoLikedStatus==="disliked"
                            ? (
                                <div 
                                    className='video-options'
                                    onClick={()=>removeFromLikedVideos()}
                                >
                                    <AiFillDislike className='options-icon'/>
                                    <span>Dislike</span>
                                </div>
                            ) : (
                                <div 
                                    className='video-options'
                                    onClick={()=>removeFromLikedVideos()}
                                >
                                    <AiOutlineDislike className='options-icon'/>
                                    <span>Dislike</span>
                                </div>
                            )
                        }
                        {
                            isVideoPresentInWatchLater
                            ? (
                                <div 
                                    className='video-options'
                                    
                                >
                                    <MdAccessTime className='options-icon'/>
                                    <span>Remove from watch later</span>
                                </div>

                            ) : (
                                <div 
                                    className='video-options'
                                    
                                >
                                    <MdAccessTime className='options-icon'/>
                                    <span>Add to watch later</span>
                                </div>
                            )
                        }
                        <div 
                            className='video-options'
                            onClick={()=>{
                                setShowPlaylistModal(prevState=> !prevState)
                            }}
                        >
                            <MdPlaylistAdd className='options-icon'/>
                            <span>Add to playlist</span>
                        </div>
                    </div>
                </div>

                <hr></hr>

                <h4>Comments</h4>
            </div>
            <div className='video-recommendation-container'>
                {
                    JSON.stringify(trendingVideosList)!==JSON.stringify([]) && 
                    (
                        trendingVideosList.map((recommendationVideo,index)=>
                            <RecommendationCard key={index} video={recommendationVideo}/>
                        )
                    )
                }
            </div>
            <AddToPlaylistModal 
                video={video}
                showPlaylistModal={showPlaylistModal} 
                setShowPlaylistModal={setShowPlaylistModal}
            />
        </div>
    )
}

export { VideoPage };
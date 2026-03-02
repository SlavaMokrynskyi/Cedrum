import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftSvg } from 'core/image/ArrowLeftSvg'
import { InfoIconSvg } from 'core/image/InfoIconSvg'
import styles from './TopBarFeatures.module.css'

interface Props{
    title: string,
    backHref?: string,
    infoWindow?: JSX.Element;
}

export default function TopBarFeatures({title,backHref,infoWindow} : Props) {

    const navigate = useNavigate()
  return (
    <div className={styles.topBar}>
        {backHref ? (<div>
            <button type='button' onClick={() => {navigate(backHref)}}>
                <ArrowLeftSvg className={styles.backIcon}/>
            </button> 
        </div>) : (<></>)}
        <div>
            <h1>{title}</h1>
        </div>
        <div>
            <InfoIconSvg className={styles.infoIcon}/>
        </div>
    </div>
  )
}

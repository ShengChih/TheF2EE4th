import React, { useRef, useState, useEffect, useCallback, ChangeEvent, DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { flatClassName } from '@/utils/reduce'
import { getCheckFileFunc } from '@/utils/validation'
import { deviceWidth } from '@/utils/config'
import useCheckScreen from '@/hooks/useCheckScreen'
import { preloadImage } from '@/hooks/useImagePreloader'
import GNsignLoadingPage, {
  LoadingPageState,
  InitLoadingState,
} from '@/components/GNsign/LoadingPage'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { selectDraftFile } from '@/features/gnsign/files/selector'
import { UPLOAD_FILE } from '@/features/gnsign/files/sagaActions'
import { GNsignFavicon } from '@/utils/favicon'
// import { SAVE_TO_HISTORY } from '@/features/gnsign/histories/sagaActions'

import MB_Greenlive from './images/mobile/green_live.png'
import MB_Logo from './images/mobile/logo.png'
import MB_Watermark from './images/mobile/watermark.png'

import TB_Greenlive from './images/tablet/green_live.png'
import TB_Logo from './images/tablet/logo.png'
import TB_Watermark from './images/tablet/watermark.png'

import PC_Greenlive from './images/desktop/green_live.png'
import PC_Logo from './images/desktop/logo.png'
import PC_LeaveBottomLeft from '@/components/GNsign/LoadingPage/images/desktop/leave_bottom_left.png'
import PC_LeaveRightTop from '@/components/GNsign/LoadingPage/images/desktop/leave_right_top.png'
import PC_GrassLeft from '@/components/GNsign/LoadingPage/images/desktop/grass_left.png'
import PC_Watermark from './images/desktop/watermark.png'

import { ToastState } from './type'
import { MaximumFileSize, InitToastState, ToastMessages } from './constants'

import MultipleImageSources from '@/components/shared/ResponsiveImageContainer/MultipleImageSources'
import Footer from '@/components/shared/Footer'
import Toast from '@/components/GNsign/Toast'
import PCFullPageStyles from './styles/fullpage/pc.module.scss'

const DeviceRequiredImageList = [
  [],
  [MB_Logo, MB_Watermark, MB_Greenlive], // mobile
  [TB_Logo, TB_Watermark, TB_Greenlive], // tablet
  [PC_Logo, PC_Greenlive, PC_LeaveBottomLeft, PC_LeaveRightTop, PC_GrassLeft, PC_Watermark], // 1280 Desktop
]

const GNSign = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const draftFile = useAppSelector(selectDraftFile)

  const inputFileRef = useRef<HTMLInputElement>(null)
  const [toastState, setToastState] = useState<ToastState>(InitToastState)
  const [loadingState, setLoadingState] = useState<LoadingPageState>(InitLoadingState)
  const [, isMobile, isTablet, isDesktop] = useCheckScreen(deviceWidth)

  const [commonResources, mobileResoures, tabletResources, desktopResoures] =
    DeviceRequiredImageList
  const deviceResources = isDesktop
    ? desktopResoures
    : isTablet
    ? tabletResources
    : isMobile
    ? mobileResoures
    : []

  GNsignFavicon()

  useEffect(() => {
    setLoadingState({
      loadingText: '載入中...',
      isLoading: true,
    })
  }, [])

  useEffect(() => {
    ;(async () => {
      const imageList = [...commonResources, ...deviceResources]
      await imageList.map(imageUrl => preloadImage(imageUrl))
      setLoadingState({
        ...loadingState,
        isLoading: false,
      })
    })()
  }, [isMobile, isTablet, isDesktop])

  useEffect(() => {
    if (draftFile) {
      setLoadingState({
        ...loadingState,
        isLoading: false,
      })
      navigate('/gnsign/makesign', { replace: true })
    }
  }, [loadingState, draftFile, navigate])

  const handleConfirmToast = useCallback(() => {
    setToastState(InitToastState)
  }, [])

  const handleSelectedFileButton = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click()
    }
  }

  const checkFile = getCheckFileFunc(
    {
      'application/pdf': true,
    },
    MaximumFileSize,
  )

  const processFile = (file: File) => {
    setLoadingState({
      loadingText: '上傳中...',
      isLoading: true,
    })

    const fileInfo = {
      fileId: uuidv4(),
      filename: file.name,
      ctime: new Date(+new Date() + 60 * 60 * 8 * 1000),
      mtime: new Date(+new Date() + 60 * 60 * 8 * 1000),
    }

    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      dispatch({
        type: UPLOAD_FILE,
        payload: {
          url: window.URL.createObjectURL(file),
          ...fileInfo,
        },
      })
      //dispatch({ type: SAVE_TO_HISTORY, payload: {
      //	url: window.URL.createObjectURL(file),
      //	...fileInfo,
      //	ctime: new Date((+new Date() - (60 * 60 * 24 * 365 * 1000))),
      //	mtime: new Date((+new Date() - (60 * 60 * 24 * 365 * 1000))),
      //}})
    } else if (file.type === 'application/pdf') {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        dispatch({
          type: UPLOAD_FILE,
          payload: {
            url: fileReader.result,
            ...fileInfo,
          },
        })
        //dispatch({ type: SAVE_TO_HISTORY, payload: {
        //	url: fileReader.result,
        //	...fileInfo,
        //	ctime: new Date((+new Date() - (60 * 60 * 24 * 365 * 1000))),
        //	mtime: new Date((+new Date() - (60 * 60 * 24 * 365 * 1000))),
        //}})
      }
      fileReader.readAsDataURL(file)
    }
  }

  const handleChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (!e.target.files) {
      return
    }

    const { result, type } = checkFile(e.target.files)
    if (!result) {
      setToastState({
        toastMessage: ToastMessages[type],
        displayToast: true,
      })
      return
    }

    const file = e.target.files[0]

    processFile(file)
  }

  const gotoHistory = () => {
    navigate('/gnsign/history', { replace: true })
  }

  const fileDragEnter = (e: DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const fileDragOver = (e: DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const fileDragDrop = (e: DragEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const dt = e.dataTransfer
    const files = dt.files

    processFile(files[0])
  }

  return (
    <>
      {loadingState.isLoading ? (
        ''
      ) : (
        <div
          className={flatClassName({
            common: `w-screen h-screen relative bg-gnsign-background flex flex-col items-center`,
            desktop: `xl:bg-white`,
          })}
        >
          <div
            className={flatClassName({
              common: `flex justify-between`,
              mobile: `sm:w-[299px] sm:h-[64.95px] sm:mt-[26.05px] sm:mb-[12px]`,
              tablet: `md:w-[517px] md:h-[87.57px] md:mt-[26.05px] md:mb-[21.38px]`,
              desktop: `xl:h-[57.15px] xl:mt-[28px] xl:mb-[19.85px] xl:pl-[40px] xl:pr-[142px] w-full`,
            })}
          >
            <div
              className={flatClassName({
                common: `relative self-start`,
                mobile: `sm:w-[88.21px] sm:h-[59.35px]`,
                tablet: `md:w-[130.75px] md:h-[87.57px]`,
                desktop: `xl:w-[88.79px] xl:h-[57.15px]`,
              })}
            >
              <MultipleImageSources
                aliasName={`GNSign`}
                mediaImages={[
                  {
                    minWidth: 1280,
                    imageSrc: PC_Logo,
                  },
                  {
                    minWidth: 768,
                    imageSrc: TB_Logo,
                  },
                  {
                    minWidth: 375,
                    imageSrc: MB_Logo,
                  },
                ]}
                imageElementProps={{
                  src: MB_Logo,
                  className: 'w-full h-full object-contain',
                  srcSet: `${MB_Logo} 375w, ${TB_Logo} 375w, ${PC_Logo} 1280`,
                  sizes: `(min-width: 375px) 88.21px, (min-width: 768px) 130.75px, (min-width: 1280px) 88.21px`,
                }}
              />
            </div>
            <div
              onKeyDown={gotoHistory}
              onClick={gotoHistory}
              className={flatClassName({
                common: `font-normal font-sans  `,
                mobile: `sm:self-end sm:text-[18px] sm:leading-[26px] sm:underline sm:text-gnsign-black`,
                tablet: `md:self-end md:text-[18px] md:leading-[26px] md:underline md:text-gnsign-black`,
                desktop: `xl:border-2 xl:border-gnsign-green xl:rounded-[16px] xl:flex xl:items-center xl:justify-center xl:mt-[3px] xl:text-[18px] xl:leading-[26px] xl:border-gnsign-green xl:text-gnsign-green xl:w-[136px] xl:h-[44px]`,
              })}
              role="link"
              tabIndex={0}
            >
              歷史記錄
            </div>
          </div>

          {isDesktop ? (
            <div
              className={flatClassName({
                common: `absolute bg-gnsign-background/[.58]`,
                desktop: `xl:w-[1036px] xl:h-[558px] xl:rounded-[34px] ${PCFullPageStyles.mainVisual}`,
              })}
            >
              <p
                className={flatClassName({
                  common: `flex items-center justify-center font-sans text-white bg-gradient-to-b from-gnsign-greenl to-gnsign-greenh`,
                  desktop: `xl:w-[225px] xl:h-[62px] xl:text-[24px] xl:leading-[35px] xl:rounded-tl-[34px] xl:rounded-br-[34px]`,
                })}
              >
                免費試用版
              </p>
              <p
                className={flatClassName({
                  common: `absolute font-sans font-bold bg-clip-text bg-gradient-to-b from-gnsign-greenl to-gnsign-greenh text-fill-transparent`,
                  desktop: `xl:translate-x-[44px] xl:translate-y-[55px] xl:text-[50px] xl:leading-[72px]`,
                })}
              >
                小綠簽
              </p>
              <p
                className={flatClassName({
                  common: `absolute`,
                  desktop: `xl:translate-x-[47px] xl:translate-y-[133px] whitespace-pre`,
                })}
              >
                {'護樹、永續、減碳的綠色生活\n響應環保無紙化電子簽署，\n省時便利又環保。'}
              </p>
            </div>
          ) : (
            ''
          )}

          <div
            className={flatClassName({
              common: `flex flex-col items-center bg-white border-dashed rounded-[26px] border-gnsign-gray border-2 box-border`,
              mobile: `sm:w-[299px] sm:h-[384px]`,
              tablet: `md:w-[547px] md:h-[567px]`,
              desktop: `xl:absolute xl:w-[417px] xl:h-[376px] xl:translate-x-[196.5px] ${PCFullPageStyles.dragRegion}`,
            })}
          >
            <div
              className={flatClassName({
                common: `absolute`,
                mobile: `sm:w-[134px] sm:h-[110px] sm:translate-y-[48.5px]`,
                tablet: `md:w-[225px] md:h-[183px] md:translate-y-[78.5px]`,
                desktop: `xl:w-[126px] xl:h-[102px] xl:translate-y-[29.5px]`,
              })}
            >
              <MultipleImageSources
                aliasName={`Watermark`}
                mediaImages={[
                  {
                    minWidth: 1280,
                    imageSrc: PC_Watermark,
                  },
                  {
                    minWidth: 768,
                    imageSrc: TB_Watermark,
                  },
                  {
                    minWidth: 375,
                    imageSrc: MB_Watermark,
                  },
                ]}
                imageElementProps={{
                  src: MB_Watermark,
                  className: 'w-full h-full object-contain',
                  srcSet: `${MB_Watermark} 375w, ${TB_Watermark} 768w`,
                  sizes: `(min-width: 375px) 134px,(min-width: 768px) 225px`,
                }}
              />
            </div>

            <div
              className={flatClassName({
                common: `absolute top-0`,
                mobile: `sm:w-[362px] sm:h-[228px] sm:translate-x-[2.5px] sm:translate-y-[412px]`,
                tablet: `md:w-[696px] md:h-[438px] md:translate-x-[-4px] md:translate-y-[549px]`,
                desktop: `xl:w-[670px] xl:h-[460px] xl:translate-y-[103px]`,
              })}
            >
              <MultipleImageSources
                aliasName={`Green live`}
                mediaImages={[
                  {
                    minWidth: 1280,
                    imageSrc: PC_Greenlive,
                  },
                  {
                    minWidth: 768,
                    imageSrc: TB_Greenlive,
                  },
                  {
                    minWidth: 375,
                    imageSrc: MB_Greenlive,
                  },
                ]}
                imageElementProps={{
                  src: MB_Greenlive,
                  className: 'w-full h-full object-contain',
                  srcSet: `${MB_Greenlive} 375w, ${TB_Greenlive} 768w, ${PC_Greenlive} 1280w`,
                  sizes: `(min-width: 375px) 362px, (min-width: 768px) 696px , (min-width: 1280px) 670px`,
                }}
              />
            </div>

            <div
              className={flatClassName({
                common: `flex flex-col absolute`,
                mobile: `sm:w-[209px] sm:h-[95px] sm:gap-y-[15px] sm:translate-y-[178.5px]`,
                tablet: `md:w-[360px] md:h-[110px] md:gap-y-[15px] md:translate-y-[296.5px]`,
                desktop: `xl:w-[227px] xl:h-[133px] xl:gap-y-[15px] xl:translate-y-[151.5px]`,
              })}
            >
              <input
                ref={inputFileRef}
                type="file"
                className="hidden"
                onChange={handleChangeFile}
              />
              <button
                onClick={handleSelectedFileButton}
                className={flatClassName({
                  common: `font-sans font-normal text-white flex items-center justify-center w-full bg-gradient-to-b from-gnsign-greenl to-gnsign-greenh rounded-[16px]`,
                  mobile: `sm:text-[18px] sm:leading-[26px] sm:w-[209px] sm:h-[60px]`,
                  tablet: `md:text-[18px] md:leading-[26px] md:w-[360px] md:h-[75px]`,
                  desktop: `xl:text-[18px] xl:leading-[26px] xl:w-[227px] xl:h-[60px]`,
                })}
              >
                選擇檔案
              </button>
              {isDesktop ? (
                <p
                  className={flatClassName({
                    common: `font-sans font-normal text-center`,
                    desktop: `xl:text-[16px] xl:leading-[23px] xl:text-gnsign-black`,
                  })}
                >
                  或拖移檔案到此處
                </p>
              ) : (
                ''
              )}
              <p
                className={flatClassName({
                  common: `flex justify-center font-sans font-normal bg-clip-text bg-gradient-to-b from-gnsign-greenl to-gnsign-greenh text-fill-transparent`,
                  mobile: `sm:text-[14px] sm:leading-[20px]`,
                  tablet: `md:text-[14px] md:leading-[20px]`,
                  desktop: `xl:text-[14px] xl:leading-[20px]`,
                })}
              >
                (限10MB 內的PDF或JPG檔)
              </p>
            </div>

            {isDesktop ? (
              <>
                <div
                  onDragEnter={fileDragEnter}
                  onDragOver={fileDragOver}
                  onDrop={fileDragDrop}
                  className={flatClassName({
                    common: `absolute rounded-[26px]`,
                    desktop: `xl:w-[417px] xl:h-[376px]`,
                  })}
                ></div>
                <button
                  onClick={handleSelectedFileButton}
                  className={flatClassName({
                    common: `font-sans font-normal text-white flex items-center justify-center w-full rounded-[16px]`,
                    desktop: `xl:text-[18px] xl:leading-[26px] xl:w-[227px] xl:h-[60px] xl:translate-y-[151.5px]`,
                  })}
                ></button>
              </>
            ) : (
              ''
            )}
          </div>
          <Footer
            className={flatClassName({
              common: `flex items-center justify-center font-sans font-normal text-gnsign-black absolute `,
              mobile: `sm:h-[37px] sm:text-[12px] sm:leading-[17px] sm:bottom-0`,
              tablet: `md:h-[37px] md:text-[12px] md:leading-[17px] md:bottom-0`,
              desktop: `xl:h-[17px] xl:text-[12px] xl:leading-[17px] xl:bottom-[17px] xl:right-[18px]`,
            })}
            content={`小綠簽 © Code: Sammy  /  Design: KT`}
          />
        </div>
      )}

      {isDesktop ? (
        <>
          <img
            alt={`leave-rt`}
            className={flatClassName({
              desktop: `xl:w-[122px] xl:h-[255px] absolute top-0 right-0`,
            })}
            src={PC_LeaveRightTop}
          />
          <img
            alt={`grass-l`}
            className={flatClassName({
              desktop: `xl:w-[243px] xl:h-[62px] absolute bottom-[159px] left-0`,
            })}
            src={PC_GrassLeft}
          />
          <img
            alt={`leave-bl`}
            className={flatClassName({
              desktop: `xl:w-[150px] xl:h-[305px] absolute bottom-0 left-0`,
            })}
            src={PC_LeaveBottomLeft}
          />
        </>
      ) : (
        ''
      )}

      <div
        className={flatClassName({
          common: `w-screen h-screen fixed inset-0 flex items-center justify-center bg-gnsign-black/[.54] ${
            toastState.displayToast ? '' : 'hidden'
          }`,
        })}
      >
        <Toast
          messageText={toastState.toastMessage}
          buttonText={`確定`}
          onConfirm={handleConfirmToast}
        ></Toast>
      </div>
      <GNsignLoadingPage isLoading={loadingState.isLoading} text={loadingState.loadingText} />
    </>
  )
}

export default GNSign

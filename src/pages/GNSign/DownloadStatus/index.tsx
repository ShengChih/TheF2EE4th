import { MouseEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { flatClassName } from "@utils/reduce"

const Success = () => (
	<svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
		<rect width="140" height="140" fill="url(#pattern0)"/>
		<defs>
			<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
				<use xlinkHref="#image0_295_826" transform="scale(0.00145349)"/>
			</pattern>
			<image id="image0_295_826" width="688" height="688" xlinkHref="data:image/png;base64,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"/>
		</defs>
	</svg>
)

const Warning = () => (
	<svg width="161" height="147" viewBox="0 0 161 147" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M60.6763 17.3716C71.6832 -1.76466 89.5568 -1.76466 100.564 17.3716C100.564 17.3716 119.809 50.8776 126.952 63.25C134.096 75.6224 153.49 109.042 153.49 109.042C164.559 128.143 155.622 143.622 133.546 143.586C133.546 143.586 94.9064 143.5 80.62 143.5C66.3336 143.5 27.6939 143.586 27.6939 143.586C5.61788 143.622 -3.31889 128.143 7.75014 109.042C7.75014 109.042 27.1445 75.6224 34.2877 63.25C41.4309 50.8776 60.6763 17.3716 60.6763 17.3716Z" fill="#FFB800"/>
<path d="M60.6763 17.3716C71.6832 -1.76466 89.5568 -1.76466 100.564 17.3716C100.564 17.3716 119.809 50.8776 126.952 63.25C134.096 75.6224 153.49 109.042 153.49 109.042C164.559 128.143 155.622 143.622 133.546 143.586C133.546 143.586 94.9064 143.5 80.62 143.5C66.3336 143.5 27.6939 143.586 27.6939 143.586C5.61788 143.622 -3.31889 128.143 7.75014 109.042C7.75014 109.042 27.1445 75.6224 34.2877 63.25C41.4309 50.8776 60.6763 17.3716 60.6763 17.3716Z" stroke="#FFB800" strokeWidth="5"/>
<path d="M80.6204 115.066C82.828 115.066 84.6567 114.326 86.1056 112.841C87.5545 111.358 88.279 109.514 88.279 107.304C88.279 105.097 87.5545 103.253 86.1056 101.768C84.6567 100.285 82.828 99.5424 80.6204 99.5424C78.411 99.5424 76.5841 100.285 75.1352 101.768C73.6863 103.253 72.9619 105.097 72.9619 107.304C72.9619 109.514 73.6863 111.358 75.1352 112.841C76.5841 114.326 78.411 115.066 80.6204 115.066ZM80.6204 93.3328C81.6554 93.3328 82.5355 92.9881 83.26 92.2978C83.9844 91.6094 84.4137 90.6077 84.5532 89.2965L88.3825 49.1409L88.486 48.0024C88.486 45.8651 87.7435 44.157 86.2604 42.879C84.7755 41.6029 82.8973 40.9648 80.6204 40.9648C78.3435 40.9648 76.4636 41.6029 74.9804 42.879C73.4955 44.157 72.7549 45.8651 72.7549 48.0024L72.8584 49.0374L76.6876 89.2965C76.8253 90.6077 77.2564 91.6094 77.9809 92.2978C78.7053 92.9881 79.5855 93.3328 80.6204 93.3328Z" fill="white"/>
</svg>
)

const DownloadStatus = () => {
	let [searchParams, _] = useSearchParams()
	let status = searchParams.get("status") ?? '';

	const Icon = (status: string) => {
		return status === 'success' ? (<>
			<div className={flatClassName({
				common: ``,
				mobile: `relative sm:w-[140px] sm:h-[140px] sm:translate-y-[166px]`
			})}>
				<Success />
			</div>
			<p className={flatClassName({
				common: `absolute font-sans font-normal text-gnsign-black`,
				mobile: `sm:text-[22px] sm:text-[32px] sm:translate-y-[334px]`
			})}>下載成功</p>
		</>
		): (
			<>
			<div className={flatClassName({
				common: ``,
				mobile: `relative sm:w-[155.24px] sm:h-[140.57px] sm:translate-y-[165.02px]`
			})}>
				<Warning />
			</div>
			<p className={flatClassName({
				common: `absolute font-sans font-normal text-gnsign-black`,
				mobile: `sm:text-[22px] sm:text-[32px] sm:translate-y-[334px]`})}
			>下載失敗，請稍候再試</p>
			</>
		)
	}

	const navigate = useNavigate()
	const goLanding = (e: MouseEvent) => {
		navigate('/gnsign', { replace: true })
	}

	return (
		<div className={flatClassName({
			common: `relative w-screen h-screen flex flex-wrap justify-center bg-gnsign-background`
		})}>
			{ Icon(status) }
			<button
				onClick={goLanding}
				className={flatClassName({
				common: `absolute text-white font-sans font-normal  flex items-center justify-center bg-gradient-to-b from-gnsign-greenl to-gnsign-greenh`,
				mobile: `sm:translate-y-[579px] sm:text-[18px] sm:leading-[26px] sm:w-[260px] sm:h-[56px] sm:rounded-[16px]`
			})}>回首頁</button>
		</div>
	)
}

export default DownloadStatus
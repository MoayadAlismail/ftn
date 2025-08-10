import LoadingAnimation from "@/components/loadingAnimation";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            {/* <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div> */}
            <LoadingAnimation size='md'/>
        </div>
    )
}
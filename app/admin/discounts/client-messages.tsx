'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { CheckCircle, TriangleAlert } from 'lucide-react'

export default function ClientMessages() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const shownRef = useRef(false)

    useEffect(() => {
        if (shownRef.current) return
        const error = searchParams.get('error')
        const success = searchParams.get('success')

        if (error) {
            shownRef.current = true
            toast.warning(error, {
                icon: <TriangleAlert className="h-5 w-5 mr-2 text-amber-500" />,
                duration: 5000,
            })
            const url = new URL(window.location.href)
            url.searchParams.delete('error')
            router.replace(url.pathname + url.search)
        } else if (success) {
            shownRef.current = true
            toast.success('Discount saved', {
                icon: <CheckCircle className="h-5 w-5 mr-2 text-green-500" />,
                duration: 3000,
            })
            const url = new URL(window.location.href)
            url.searchParams.delete('success')
            router.replace(url.pathname + url.search)
        }
    }, [searchParams, router])

    return null
}

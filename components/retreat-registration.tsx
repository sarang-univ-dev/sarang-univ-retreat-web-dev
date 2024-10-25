'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { TRetreatInfo, TGrade, TUnivGroup, TSchedule } from '../types'

interface RetreatRegistrationComponentProps {
  retreatId: string
}

// 실제 API 호출 함수 using axios
const fetchRetreatData = async (id: string): Promise<TRetreatInfo> => {
  try {
    const response = await axios.get<TRetreatInfo>(`/api/v1/retreat/${id}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || 'Failed to fetch retreat data')
    } else {
      throw new Error('Failed to fetch retreat data')
    }
  }
}

const groupDates = (dates: string[]): string[] => {
  if (dates.length === 0) return []

  const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  const groups: string[] = []
  let currentGroupStart = sortedDates[0]
  let previousDate = new Date(sortedDates[0])

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])

    // Check if the current date is consecutive
    if ((currentDate.getTime() - previousDate.getTime()) === 24 * 60 * 60 * 1000) {
      previousDate = currentDate
      continue
    } else {
      if (currentGroupStart === sortedDates[i - 1]) {
        groups.push(currentGroupStart)
      } else {
        groups.push(`${currentGroupStart}~${sortedDates[i - 1]}`)
      }
      currentGroupStart = sortedDates[i]
      previousDate = currentDate
    }
  }

  // Add the last group
  if (currentGroupStart === sortedDates[sortedDates.length - 1]) {
    groups.push(currentGroupStart)
  } else {
    groups.push(`${currentGroupStart}~${sortedDates[sortedDates.length - 1]}`)
  }

  return groups
}

export function RetreatRegistrationComponent({ retreatId }: RetreatRegistrationComponentProps) {
  const [retreatData, setRetreatData] = useState<TRetreatInfo['retreat'] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [formData, setFormData] = useState<{
    univGroup: string
    grade: string
    name: string
    phoneNumber: string
    scheduleSelection: number[]
    privacyConsent: boolean
  }>({
    univGroup: '',
    grade: '',
    name: '',
    phoneNumber: '',
    scheduleSelection: [],
    privacyConsent: false
  })
  const [availableGrades, setAvailableGrades] = useState<TGrade[]>([])
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [formErrors, setFormErrors] = useState<{
    univGroup: string
    grade: string
    name: string
    phoneNumber: string
    scheduleSelection: string
    privacyConsent: string
  }>({
    univGroup: '',
    grade: '',
    name: '',
    phoneNumber: '',
    scheduleSelection: '',
    privacyConsent: ''
  })

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchRetreatData(retreatId)
        setRetreatData(data.retreat)
      } catch (error) {
        console.error("Failed to fetch retreat data:", error)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [retreatId])

  useEffect(() => {
    if (retreatData) {
      const eventCount = formData.scheduleSelection.length
      const calculatedPrice = Math.min(
        eventCount * retreatData.payment.partial_price_per_event,
        retreatData.payment.total_price
      )
      setTotalPrice(calculatedPrice)
    }
  }, [formData.scheduleSelection, retreatData])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!retreatData) {
    return <div className="flex justify-center items-center h-screen">Retreat not found</div>
  }

  const handleUnivGroupChange = (value: string) => {
    const selectedGroup: TUnivGroup | undefined = retreatData.univ_group_and_grade.find(
      (group: TUnivGroup) => group.univ_group_id.toString() === value
    )
    setAvailableGrades(selectedGroup ? selectedGroup.grades : [])
    setFormData({ ...formData, univGroup: value, grade: '' })
    setFormErrors({ ...formErrors, univGroup: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setFormErrors({ ...formErrors, [name]: '' })

    if (name === 'phoneNumber') {
      const phoneRegex = /^010-\d{4}-\d{4}$/
      if (!phoneRegex.test(value)) {
        setFormErrors(prevErrors => ({ ...prevErrors, phoneNumber: 'Please enter a valid phone number in the format 010-1234-5678' }))
      } else {
        setFormErrors(prevErrors => ({ ...prevErrors, phoneNumber: '' }))
      }
    }
  }

  const handleScheduleChange = (id: number) => {
    const updatedSelection = formData.scheduleSelection.includes(id)
      ? formData.scheduleSelection.filter(item => item !== id)
      : [...formData.scheduleSelection, id]
    setFormData({ ...formData, scheduleSelection: updatedSelection })
    setFormErrors(prevErrors => ({ ...prevErrors, scheduleSelection: '' }))
  }

  const handleAllScheduleChange = (checked: boolean) => {
    const allScheduleIds: number[] = retreatData.schedule.map((item: TSchedule) => item.id)
    setFormData({ ...formData, scheduleSelection: checked ? allScheduleIds : [] })
    setFormErrors(prevErrors => ({ ...prevErrors, scheduleSelection: '' }))
  }

  const handlePrivacyConsentChange = (checked: boolean) => {
    setFormData({ ...formData, privacyConsent: checked })
    setFormErrors(prevErrors => ({ ...prevErrors, privacyConsent: '' }))
  }

  const validateForm = (): boolean => {
    const errors = {
      univGroup: '',
      grade: '',
      name: '',
      phoneNumber: '',
      scheduleSelection: '',
      privacyConsent: ''
    }
    let isValid = true

    if (!formData.univGroup) {
      errors.univGroup = "Please select a University Group"
      isValid = false
    }
    if (!formData.grade) {
      errors.grade = "Please select a Grade"
      isValid = false
    }
    if (!formData.name.trim()) {
      errors.name = "Please enter your Name"
      isValid = false
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Please enter your Phone Number"
      isValid = false
    } else {
      const phoneRegex = /^010-\d{4}-\d{4}$/
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = "Please enter a valid phone number in the format 010-1234-5678"
        isValid = false
      }
    }
    if (formData.scheduleSelection.length === 0) {
      errors.scheduleSelection = "Please select at least one event from the schedule"
      isValid = false
    }
    if (!formData.privacyConsent) {
      errors.privacyConsent = "You must agree to the privacy policy to register"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validateForm()) {
      const submissionData = {
        ...formData,
        totalPrice,
        grade: Number(formData.grade),
        univGroup: Number(formData.univGroup),
        scheduleSelection: formData.scheduleSelection,
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        privacyConsent: formData.privacyConsent
      }

      console.log("Form submitted:", submissionData)
      // Example axios POST request (uncomment and adjust as needed)
      /*
      try {
        const response = await axios.post('/api/v1/register', submissionData)
        // Handle success (e.g., display a success message, redirect, etc.)
        console.log('Registration successful:', response.data)
      } catch (error: any) {
        console.error('Registration failed:', error.response?.data?.message || error.message)
        // Optionally, set form errors based on the response
      }
      */
    }
  }

  const groupedDates = groupDates(retreatData?.dates || [])

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{retreatData.name}</h1>        
        {/* <img src={retreatData.image_url} alt={retreatData.name} className="w-full h-48 object-cover mb-4" /> */}
        <p>Dates: {groupedDates.join(', ')}</p>
        <p>Location: {retreatData.location}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacyConsent"
                checked={formData.privacyConsent}
                onCheckedChange={handlePrivacyConsentChange}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="privacyConsent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the privacy policy
                </label>
                <p className="text-sm text-muted-foreground">
                  By checking this box, you agree to our{" "}
                  <a href="#" className="text-primary underline">
                    Privacy Policy
                  </a>{" "}
                  and consent to the collection and use of your personal information.
                </p>
              </div>
            </div>
            {formErrors.privacyConsent && <p className="text-red-500 text-sm mt-1">{formErrors.privacyConsent}</p>}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="univGroup">University Group</Label>
            <Select onValueChange={handleUnivGroupChange} value={formData.univGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select University Group" />
              </SelectTrigger>
              <SelectContent>
                {retreatData.univ_group_and_grade.map((group: TUnivGroup) => (
                  <SelectItem key={group.univ_group_id} value={group.univ_group_id.toString()}>
                    {group.univ_group_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.univGroup && <p className="text-red-500 text-sm mt-1">{formErrors.univGroup}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select 
              onValueChange={(value: string) => {
                setFormData({ ...formData, grade: value })
                setFormErrors(prevErrors => ({ ...prevErrors, grade: '' }))
              }} 
              value={formData.grade}
              disabled={!formData.univGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {availableGrades.map((grade: TGrade) => (
                  <SelectItem key={grade.grade_id} value={grade.grade_id.toString()}>
                    {`${grade.grade_number}학년 ${grade.grade_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.grade && <p className="text-red-500 text-sm mt-1">{formErrors.grade}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="010-1234-5678"
            />
            {formErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Retreat Schedule</h2>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="allSchedule"
              checked={formData.scheduleSelection.length === retreatData.schedule.length}
              onCheckedChange={(checked: boolean) => handleAllScheduleChange(checked)}
            />
            <label htmlFor="allSchedule" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select All
            </label>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                {retreatData.dates.map((date: string) => (
                  <TableHead key={date}>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {['BREAKFAST', 'LUNCH', 'DINNER'].map((eventType) => (
                <TableRow key={eventType}>
                  <TableCell>{eventType}</TableCell>
                  {retreatData.dates.map((date: string) => {
                    // Find the event based on date and type
                    const event: TSchedule | undefined = retreatData.schedule.find(
                      (s: TSchedule) => s.date.toISOString().startsWith(new Date(date).toISOString()) && s.type === eventType
                    )
                    return (
                      <TableCell key={date}>
                        {event ? (
                          <Checkbox
                            checked={formData.scheduleSelection.includes(event.id)}
                            onCheckedChange={() => handleScheduleChange(event.id)}
                          />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {formErrors.scheduleSelection && <p className="text-red-500 text-sm mt-1">{formErrors.scheduleSelection}</p>}
          <div className="mt-4 text-right">
            <p className="font-bold">
              Total Price: ₩{totalPrice.toLocaleString()}
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full">Register</Button>
      </form>
    </div>
  )
}

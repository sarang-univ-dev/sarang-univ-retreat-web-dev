'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

// Mock API call
const fetchRetreatData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        retreat: {
          name: "Summer Coding Retreat 2024",
          image_url: "/placeholder.svg?height=200&width=400",
          dates: ['2024-07-01', '2024-07-02', '2024-07-04', '2024-07-05'],
          location: "Tech Valley Resort",
          univ_group_and_grade: [
            {
              "univ_group_id": 1,
              "univ_group_name": "Computer Science",
              "univ_group_number": 101,
              "grades": [
                {
                  "grade_id": 1,
                  "grade_name": "Freshman",
                  "grade_number": 1
                },
                {
                  "grade_id": 2,
                  "grade_name": "Sophomore",
                  "grade_number": 2
                }
              ]
            },
            {
              "univ_group_id": 2,
              "univ_group_name": "Mechanical Engineering",
              "univ_group_number": 102,
              "grades": [
                {
                  "grade_id": 3,
                  "grade_name": "Junior",
                  "grade_number": 3
                },
                {
                  "grade_id": 4,
                  "grade_name": "Senior",
                  "grade_number": 4
                }
              ]
            }
          ],
          schedule: [
            { id: 1, time: '2024-07-01 08:00:00', type: 'BREAKFAST' },
            { id: 2, time: '2024-07-01 12:00:00', type: 'LUNCH' },
            { id: 3, time: '2024-07-01 18:00:00', type: 'DINNER' },
            { id: 5, time: '2024-07-02 08:00:00', type: 'BREAKFAST' },
            { id: 7, time: '2024-07-02 18:00:00', type: 'DINNER' },
            { id: 9, time: '2024-07-04 08:00:00', type: 'BREAKFAST' },
            { id: 10, time: '2024-07-04 12:00:00', type: 'LUNCH' },
            { id: 13, time: '2024-07-05 08:00:00', type: 'BREAKFAST' },
            { id: 15, time: '2024-07-05 18:00:00', type: 'DINNER' },
          ],
          payment: {
            total_price: 100000,
            partial_price_per_event: 25000,
          }
        }
      })
    }, 1000)
  })
}

const groupDates = (dates) => {
  const sortedDates = dates.sort((a, b) => new Date(a) - new Date(b))
  const groups = []
  let currentGroup = [sortedDates[0]]

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    const previousDate = new Date(sortedDates[i - 1])
    
    if (currentDate - previousDate === 24 * 60 * 60 * 1000) {
      currentGroup.push(sortedDates[i])
    } else {
      groups.push(currentGroup)
      currentGroup = [sortedDates[i]]
    }
  }
  
  groups.push(currentGroup)

  return groups.map(group => {
    if (group.length === 1) {
      return group[0]
    } else {
      return `${group[0]}~${group[group.length - 1]}`
    }
  })
}

export function RetreatRegistrationComponent() {
  const [retreatData, setRetreatData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    univGroup: '',
    grade: '',
    name: '',
    phoneNumber: '',
    scheduleSelection: [],
    privacyConsent: false
  })
  const [availableGrades, setAvailableGrades] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [formErrors, setFormErrors] = useState({
    univGroup: '',
    grade: '',
    name: '',
    phoneNumber: '',
    scheduleSelection: '',
    privacyConsent: ''
  })

  useEffect(() => {
    fetchRetreatData().then((data) => {
      setRetreatData(data.retreat)
      setLoading(false)
    }).catch((error) => {
      console.error("Failed to fetch retreat data:", error)
      setLoading(false)
    })
  }, [])

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

  const handleUnivGroupChange = (value) => {
    const selectedGroup = retreatData.univ_group_and_grade.find(group => group.univ_group_id.toString() === value)
    setAvailableGrades(selectedGroup ? selectedGroup.grades : [])
    setFormData({ ...formData, univGroup: value, grade: '' })
    setFormErrors({ ...formErrors, univGroup: '' })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setFormErrors({ ...formErrors, [name]: '' })

    if (name === 'phoneNumber') {
      const phoneRegex = /^010-\d{4}-\d{4}$/
      if (!phoneRegex.test(value)) {
        setFormErrors({ ...formErrors, phoneNumber: 'Please enter a valid phone number in the format 010-1234-5678' })
      } else {
        setFormErrors({ ...formErrors, phoneNumber: '' })
      }
    }
  }

  const handleScheduleChange = (id) => {
    const updatedSelection = formData.scheduleSelection.includes(id)
      ? formData.scheduleSelection.filter(item => item !== id)
      : [...formData.scheduleSelection, id]
    setFormData({ ...formData, scheduleSelection: updatedSelection })
    setFormErrors({ ...formErrors, scheduleSelection: '' })
  }

  const handleAllScheduleChange = (checked) => {
    const allScheduleIds = retreatData.schedule.map(item => item.id)
    setFormData({ ...formData, scheduleSelection: checked ? allScheduleIds : [] })
    setFormErrors({ ...formErrors, scheduleSelection: '' })
  }

  const handlePrivacyConsentChange = (checked) => {
    setFormData({ ...formData, privacyConsent: checked })
    setFormErrors({ ...formErrors, privacyConsent: '' })
  }

  const validateForm = () => {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validateForm()) {
      console.log("Form submitted:", { ...formData, totalPrice })
      // Here you would typically send the form data to your backend
    }
  }

  const groupedDates = groupDates(retreatData.dates)

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{retreatData.name}</h1>
        <img src={retreatData.image_url} alt={retreatData.name} className="w-full h-48 object-cover mb-4" />
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
                {retreatData.univ_group_and_grade.map((group) => (
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
              onValueChange={(value) => {
                setFormData({ ...formData, grade: value })
                setFormErrors({ ...formErrors, grade: '' })
              }} 
              value={formData.grade}
              disabled={!formData.univGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {availableGrades.map((grade) => (
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
              onCheckedChange={handleAllScheduleChange}
            />
            <label htmlFor="allSchedule" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select All
            
            </label>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                {retreatData.dates.map((date) => (
                  <TableHead key={date}>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {['BREAKFAST', 'LUNCH', 'DINNER'].map((eventType) => (
                <TableRow key={eventType}>
                  <TableCell>{eventType}</TableCell>
                  {retreatData.dates.map((date) => {
                    const event = retreatData.schedule.find(
                      (s) => s.time.startsWith(date) && s.type === eventType
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
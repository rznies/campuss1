import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSwipeable } from "react-swipeable"
import { getOnboardingQuestions, submitOnboardingAnswers } from "@/api/onboarding"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/useToast"

type Question = {
  _id: string
  question: string
  options: Array<{ value: string; emoji: string }>
}

export function Onboarding() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<{ questionId: string; answer: string }>>([])
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await getOnboardingQuestions()
        setQuestions(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load questions",
        })
      }
    }
    loadQuestions()
  }, [toast])

  const handleSwipe = async (option: string) => {
    const currentQuestion = questions[currentIndex]
    setAnswers([...answers, { questionId: currentQuestion._id, answer: option }])

    if (currentIndex + 1 >= questions.length) {
      try {
        await submitOnboardingAnswers({ answers: [...answers, { questionId: currentQuestion._id, answer: option }] })
        navigate("/")
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit answers",
        })
      }
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe(questions[currentIndex].options[0].value),
    onSwipedRight: () => handleSwipe(questions[currentIndex].options[2].value),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  })

  if (questions.length === 0) {
    return null
  }

  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      {currentIndex === 0 && (
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">Welcome to Campusphere!</h1>
          <p className="text-xl text-muted-foreground">College life's secret ingredient.</p>
          <img
            src="https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif"
            alt="Welcome"
            className="w-64 h-64 mx-auto mt-4 rounded-lg"
          />
        </div>
      )}
      <div className="w-full max-w-md">
        <Progress value={progress} className="mb-8" />
        <div {...handlers}>
          <Card className="p-8 backdrop-blur-lg bg-background/80 shadow-lg transform transition-all hover:scale-105">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {questions[currentIndex].question}
            </h2>
            <div className="flex justify-around text-4xl mb-8">
              {questions[currentIndex].options.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className="text-4xl p-4 hover:bg-accent"
                  onClick={() => handleSwipe(option.value)}
                >
                  {option.emoji}
                </Button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Swipe left or right to choose
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
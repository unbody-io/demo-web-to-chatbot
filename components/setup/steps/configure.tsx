"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { KnowledgeBaseCard } from "./configure/knowledge-base-card"
import { TabNavigation } from "./configure/tab-navigation"
import { PersonaSection } from "./configure/persona-section"
import { QuestionsSection } from "./configure/questions-section"
import { SubmitButton } from "./configure/submit-button"
import { useFetchPOST, useFetchGET } from "@/hooks/useFetch"
import { IChatbotContext, IChatbotConfigs, IPersonaPrompt } from "@/types/data.types"
import { v4 as uuidv4 } from 'uuid';
interface ConfigureStepProps {
  onSubmit?: (context: IChatbotContext) => void
}

interface ConfigPanelProps {
  onChange: (configs: Partial<IChatbotConfigs>) => void
  context: IChatbotContext
}

type Persona = {
  value: string
  id: string
}

const ConfigPanel = memo(({ onChange, context }: ConfigPanelProps) => {
  const [persona, setPersona] = useState<Persona|null>(context?.configs?.personaPrompt ? {value: context?.configs?.personaPrompt, id: uuidv4()} : null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]|null>(context?.configs?.initialQuestions || null)
  const [activeSection, setActiveSection] = useState<"persona" | "questions">("persona")

  const [personaHistory, setPersonaHistory] = useState<Persona[]>([
    context?.configs?.personaPrompt ? {value: context?.configs?.personaPrompt, id: uuidv4()} : null
  ].filter(Boolean) as Persona[])

  const { data, loading, error, execute } = useFetchPOST<IPersonaPrompt>(
    null,
    null
  )

  useEffect(() => {
    if(persona) {
      onChange({
        personaPrompt: persona.value,
      })
    }
  }, [persona])

  useEffect(() => {
    if(data && !loading && !error) {
      const newPersona = {value: data.personaPrompt, id: uuidv4()}
      setPersonaHistory([...personaHistory, newPersona])
      setPersona(newPersona)
    }
  }, [data])

  const handlePersonaChange = (value: string) => {
    if(!persona) {
      return;
    }
    const updatedPersona = {
      ...persona,
      value
    }
    setPersona(updatedPersona)
    setPersonaHistory(prev => [...prev, updatedPersona])
  }

  const handleQuestionsChange = (value: string[]) => {
    setSuggestedQuestions(value)
    onChange({
      initialQuestions: value,
    })
  }

  useEffect(() => {
    if (context) {
      setSuggestedQuestions(context.configs?.initialQuestions || null)
      setPersonaHistory([{
        value: context.configs?.personaPrompt || "",
        id: uuidv4()
      }]);
    }
  }, [context])

  const handleNewPersonaAsked = async () => {
    await execute({
      url: "/api/setup/config/persona",
      body: { context, history: personaHistory }
    })
  }

  return (
    <>
      <TabNavigation activeTab={activeSection} onTabChange={setActiveSection} />
      <AnimatePresence mode="wait">
        {activeSection === "persona" ? (
          <PersonaSection persona={persona?.value || null} 
                          loading={loading}
                          onPersonaAdjusted={handlePersonaChange} 
                          onNewPersonaAsked={handleNewPersonaAsked} 
                          />
        ) : (
          <QuestionsSection starterQuestions={suggestedQuestions} 
                            setStarterQuestions={handleQuestionsChange} />
        )}
      </AnimatePresence>
    </>
  )
})

const KnowledgeBasePanel = ({context}: {context: IChatbotContext}) => {
  const [summary, setSummary] = useState<string|null>(null)

  const { data, loading, error, execute } = useFetchPOST<{summary: string}>(
    "/api/setup/config/knowledge-summary",
    null
  )
  
  useEffect(() => {
    if (context) {
      execute(context);
    }
  }, [context]);
  
  useEffect(() => {
    if (data) {
      setSummary(data.summary)
    }
  }, [data])

  return (
    <KnowledgeBaseCard summary={summary} 
                       numPages={context?.pages?.length || null} />
  )
}

export function ConfigureStep({
  onSubmit
}: ConfigureStepProps) {
  const { data: contextData, loading: contextLoading, error: contextError } = useFetchGET<{context: IChatbotContext}>(
    "/api/setup/config/context"
  )
  
  const [configs, setConfigs] = useState<Partial<IChatbotConfigs>>(
    contextData?.context?.configs || {}
  )

  useEffect(() => {
    if (contextData?.context?.configs) {
      setConfigs(contextData.context.configs);
    }
  }, [contextData]);

  const { execute: updateConfigs } = useFetchPOST(
    "/api/setup/config/update",
    null
  )

  const handleChange = useCallback((newConfigs: Partial<IChatbotConfigs>) => {
    setConfigs((prev) => ({...prev, ...newConfigs}))
  }, []);

  const handleSubmit = async () => {
    if (!contextData?.context) return;

    await updateConfigs({
      body: {
        context: contextData.context,
        configs
      }
    })

    onSubmit?.({
      ...contextData.context,
      configs: configs as IChatbotConfigs
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {
        (contextLoading || contextError) ? (
          <>
            {contextLoading && <div>Loading...</div>}
            {contextError && <div>Error loading context</div>}
          </>
        ) : (
          <div className="">
            <div className="flex-1 fade-scrollbar pr-1">
              {contextData?.context && <KnowledgeBasePanel context={contextData.context}/>}
              {contextData?.context && <ConfigPanel onChange={handleChange} context={contextData.context}/>}
            </div>
          </div>
        )
      }
      <SubmitButton onSubmit={handleSubmit} />
    </motion.div>
  )
}

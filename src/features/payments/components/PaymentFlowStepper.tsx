import React from 'react'
import {
  PacketJourney,
  type JourneyNode,
} from '../../../components/PacketJourney'
import { UserIcon, CreditCardIcon, ServerIcon, GlobeIcon } from 'lucide-react'
export type FlowStage =
  | 'idle'
  | 'initiating'
  | 'awaitingPayment'
  | 'paymentSuccess'
  | 'paymentFailed'
  | 'registering'
  | 'registrationSuccess'
  | 'registrationFailed'
interface PaymentFlowStepperProps {
  stage: FlowStage
  paymentSublabel?: string
  registrationSublabel?: string
}
/**
 * Visualizes the full payment → registration journey.
 * 4 nodes: You → Payment Gateway → Our Server → Registry
 * Animated packets flow across the currently-active edge.
 */
export function PaymentFlowStepper({
  stage,
  paymentSublabel,
  registrationSublabel,
}: PaymentFlowStepperProps) {
  const nodes: JourneyNode[] = [
    {
      id: 'you',
      label: 'You',
      icon: UserIcon,
      state: 'done',
    },
    {
      id: 'gateway',
      label: 'Payment',
      sublabel: paymentSublabel,
      icon: CreditCardIcon,
      state:
        stage === 'idle'
          ? 'idle'
          : stage === 'initiating' || stage === 'awaitingPayment'
            ? 'active'
            : stage === 'paymentFailed'
              ? 'error'
              : 'done',
    },
    {
      id: 'server',
      label: 'Our Server',
      sublabel: registrationSublabel,
      icon: ServerIcon,
      state:
        stage === 'registering'
          ? 'active'
          : stage === 'registrationSuccess'
            ? 'done'
            : stage === 'registrationFailed'
              ? 'error'
              : stage === 'paymentSuccess'
                ? 'active'
                : 'idle',
    },
    {
      id: 'registry',
      label: 'Registry',
      icon: GlobeIcon,
      state:
        stage === 'registrationSuccess'
          ? 'done'
          : stage === 'registrationFailed'
            ? 'error'
            : stage === 'registering'
              ? 'active'
              : 'idle',
    },
  ]
  const activeEdge =
    stage === 'initiating' || stage === 'awaitingPayment'
      ? 0
      : stage === 'paymentSuccess'
        ? 1
        : stage === 'registering'
          ? 2
          : null
  const erroredEdge =
    stage === 'paymentFailed' ? 0 : stage === 'registrationFailed' ? 2 : null
  return (
    <PacketJourney
      nodes={nodes}
      activeEdge={activeEdge}
      erroredEdge={erroredEdge}
    />
  )
}

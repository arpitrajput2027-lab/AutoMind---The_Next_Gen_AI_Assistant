# core/interaction.py - Interactive Conversations

from core.llm import ask_llm
import json
import re

class InteractionManager:
    def __init__(self):
        self.interaction_state = {
            "waiting_for_response": False,
            "last_question": None,
            "context": {},
            "depth": 0
        }
    
    def needs_clarification(self, user_input, llm_response):
        """
        Check if LLM needs more information
        Returns: (bool, question_text)
        """
        # Check for clarification markers in LLM response
        markers = [
            "could you clarify",
            "which",
            "please specify",
            "do you mean",
            "can you provide more details"
        ]
        
        lower_response = llm_response.lower()
        for marker in markers:
            if marker in lower_response:
                return True, llm_response
        
        # Check for incomplete parameters
        if "{{" in llm_response and "}}" in llm_response:
            return True, llm_response
        
        return False, None
    
    def ask_clarifying_question(self, question):
        """Store state and return question"""
        self.interaction_state["waiting_for_response"] = True
        self.interaction_state["last_question"] = question
        self.interaction_state["depth"] += 1
        return question
    
    def process_user_response(self, response):
        """Process user's answer to clarifying question"""
        if not self.interaction_state["waiting_for_response"]:
            return None
        
        # Store context
        self.interaction_state["context"]["last_response"] = response
        self.interaction_state["waiting_for_response"] = False
        
        return response
    
    def reset(self):
        """Reset interaction state"""
        self.interaction_state = {
            "waiting_for_response": False,
            "last_question": None,
            "context": {},
            "depth": 0
        }

# Global instance
interaction_manager = InteractionManager()
import 'dart:async';

class GeminiService {
  // This is the function your UI team will call.
  // It waits 2 seconds to simulate "Thinking" and then returns fixed data.
  
  Future<Map<String, dynamic>> analyzeImage(String imagePath) async {
    print("Analyze function called with: $imagePath");

    // Simulate network delay
    await Future.delayed(Duration(seconds: 2));

    // Fake Response
    return {
      "status": "danger",
      "verdict": "DENIED",
      "item_detected": "Expensive Sneakers",
      "estimated_price": 12000,
      "roast_message": "You have ₹800 in your bank. Unless these shoes can walk you to a job, put them back.",
      "projected_balance": -11200
    };
  }
}
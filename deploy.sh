#!/bin/bash

# Add all changes to git
git add .

# Commit with a default message
git commit -m "default Message"

# Push to the main branch
git push origin main

# Deploy to Firebase
firebase deploy
# mini-agents

<image id="minis" src="./minis.PNG" height="500" width="500" style="display:flex;justify-self:center;"/>

To thrive in our post AI-world, software engineers need to learn to use AI not just with development tools like Copilot, Cursor, and Windsail, but also as a component _of_ their software. We need to learn to think of AI as another layer in our software stack alongside mobile and web frontends, SQL databases, identity providers, CDNs, etc.

I've built out the projects in this repo as an exercise in learning to think along those lines. Each one leverages GPT to not just answer a question, but to perform an action. Thus I've called these projects "mini-agents."

Central to these projects is OpenAI's concept of [tool-calling](https://platform.openai.com/docs/guides/function-calling). Tool calling gives the model information about functions that are available in your software and their parameters, then the model can generate arguments to those functions in a predictable format, so your program can call the function the model chooses to complete the task you've asked it to.

## Magic Buckets
I've dubbed the first two workflows "Magic Buckets" because I envision a setup where you drop various screenshots or documents in a cloud storage place (like an AWS S3 bucket) and the AI periodically reads the contents and takes the correct action for each item.

### Notion Editor: Editing a Notion database from a screenshot

The prompt central to Notion Editor is:

> Have a look at these images. If one of them appears to be a screenshot of a workout app, call the correct tool to add the info to the database. Assume each set is 12 reps, and the weight of each set is 100 pounds. If you can't call a tool, describe the image in detail.

We make a function available that calls the Notion API to update a database with the information that GPT provides.

### Git Editor: Editing the contents of a GitHub repo from a screenshot

The prompt that drives Git Editor is:

> Have a look at these images. If one of them appears to be a screenshot of a nutrition app, call the github edit tool and append the proper data to the file. You must write the whole file, so include the existing data in your response. The existing data is ${textData}

The existing data in my case is a Markdown table like this:

| Date | Calories | Protein (g) | Fat (g) | Carbohydrates (g) |
|------|----------|-------------|---------|-------------------|
| 2025-08-20 | 2148 | 132 | 98 | 197 |
| 2025-08-21 | 1833 | 78 | 97 | 165 |

GPT can read that table and understand how to generate data with the new information, then it can call a tool we provide that lets it edit the content of that file in a git repo via the Github API.

This is very powerful, considering that git repos can be used to build virtually any type of software, and how trivial it is to turn a Github repo into a website via Github pages. 

## Self-writing Journals

### Daily Summary

The LLM prompt central to this project is:

> read the provided text strings and based on the contents, generate a full html document with bulleted lists and headings. if the item is prefixed with "todo", put it under a "To Do" heading; if it is prefixed with "idea", put it under an "Ideas" heading, etc. Remove the prefix. If there is no prefix, put it under a " Miscellaneous Note" heading. The H1 of the document should be todays date, which is ${Date()}, formatted as MN/DD/YYYY

The program can read a collection of text files, which could be various notes, ideas, or to-do items collected over the course of the day. The AI will organize those various notes in one succint document.

I envision a system where the user "jots down" thoughts as the occur over the course of a day (I've been experimenting with iPhone shortcuts for this), and the AI can format, organize, and do any number of tasks with them.


## Running the Demo Server

1. Set up the environmental variables. Copy or rename `.env.example` to `.env` to get started. 
You'll need an Open AI API key for all projects. Notion-editor requires a notion API key and Database ID, and git-editor requires all four github variables

2. `bun install`
3. `bun run start`


> [!CAUTION]
> `magic-bucket` and `git-editor-text-prompt` open websocket connections to stream the workflow's progress. If you restart the server while a websocket connection is open, the workflow will restart (just trying to save you some OpenAI tokens 😉).

The demo server will provide these paths for serving UIs:
- `http://localhost:3000/magic-bucket`
- `http://localhost:3000/self-writing-journal` (this one may take a while to load, since it makes the call the OpenAI to generate the HTML doc itself)

import os
import sys

# Reconfigure stdout/stderr to use UTF-8 to prevent encoding errors on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import argparse

# 1. Load environment variables from the workspace .env file
env_path = r"c:\finscheme\.env"
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()

# Align Gemini API Key variables to ensure either sets both
gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if gemini_key:
    os.environ["GEMINI_API_KEY"] = gemini_key
    os.environ["GOOGLE_API_KEY"] = gemini_key

# Set OpenAI environment variables to use Vercel AI Gateway fallback if needed
if "OPENAI_API_KEY" not in os.environ and "AI_GATEWAY_API_KEY" in os.environ:
    os.environ["OPENAI_API_KEY"] = os.environ["AI_GATEWAY_API_KEY"]

if "OPENAI_BASE_URL" not in os.environ:
    os.environ["OPENAI_BASE_URL"] = "https://gateway.ai.vercel.com/v1"

# 2. Configure Python imports search paths dynamically
sys.path.extend([
    r"c:\finscheme\PraisonAI\src\praisonai",
    r"c:\finscheme\PraisonAI\src\praisonai-agents"
])

from praisonaiagents import Agent, Task, AgentTeam

def main():
    parser = argparse.ArgumentParser(description="PraisonAI Workspace Swarm Helper")
    parser.add_argument("--task", type=str, required=True, help="Main task instructions/query")
    parser.add_argument("--agents", type=str, default="assistant", help="Comma-separated list of agent roles (e.g. researcher,writer)")
    parser.add_argument("--model", type=str, default="gemini/gemini-2.5-flash", help="LLM model to use for the swarm (default: gemini/gemini-2.5-flash)")
    parser.add_argument("--output", type=str, help="File path to write the execution result")
    parser.add_argument("--verbose", type=int, default=1, choices=[0, 1, 2, 3, 4, 5], help="Verbose level (0-5, default: 1)")
    
    args = parser.parse_args()
    
    roles = [r.strip() for r in args.agents.split(",") if r.strip()]
    if not roles:
        roles = ["assistant"]
        
    agents_list = []
    tasks_list = []
    
    # Create agents and tasks sequentially
    if len(roles) == 1:
        role = roles[0]
        agent = Agent(
            name=role.capitalize(),
            role=role,
            goal=f"Complete the task: {args.task}",
            backstory=f"An expert {role} specialized in completing complex tasks efficiently.",
            llm=args.model
        )
        task = Task(
            description=args.task,
            expected_output=f"The completed output for: {args.task}",
            agent=agent
        )
        agents_list.append(agent)
        tasks_list.append(task)
    else:
        prev_task = None
        for i, role in enumerate(roles):
            agent = Agent(
                name=role.capitalize(),
                role=role,
                goal=f"Contribute to the task as a {role}: {args.task}",
                backstory=f"An expert {role} working within a collaborative swarm.",
                llm=args.model
            )
            agents_list.append(agent)
            
            if i == 0:
                task_desc = f"Analyze the requirements and perform the initial research/work for the task: {args.task}"
                expected = f"Initial findings and research regarding: {args.task}"
            elif i == len(roles) - 1:
                task_desc = f"Synthesize all previous information and generate the final, polished response for the task: {args.task}"
                expected = f"Final completed and polished result for: {args.task}"
            else:
                task_desc = f"Process the previous results and perform intermediate analysis for the task: {args.task}"
                expected = f"Intermediate results for: {args.task}"
                
            task = Task(
                description=task_desc,
                expected_output=expected,
                agent=agent
            )
            if prev_task:
                task.context = [prev_task]
            tasks_list.append(task)
            prev_task = task

    # Initialize the team
    team = AgentTeam(
        agents=agents_list,
        tasks=tasks_list,
        process="sequential",
        output={"verbose": args.verbose, "stream": False}
    )
    
    # Run the team swarm
    print(f"Starting PraisonAI Agent Swarm with roles: {', '.join(roles)} using model: {args.model}...", file=sys.stderr)
    result = team.start()
    
    # Parse the result
    final_output = ""
    if result:
        if isinstance(result, dict) and "task_results" in result:
            task_results = result["task_results"]
            if task_results:
                # Get the last task output
                last_task_id = list(task_results.keys())[-1]
                last_output = task_results[last_task_id]
                if hasattr(last_output, "raw"):
                    final_output = last_output.raw
                elif isinstance(last_output, dict) and "raw" in last_output:
                    final_output = last_output["raw"]
                else:
                    final_output = str(last_output)
        else:
            final_output = str(result)
            
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(final_output)
        print(f"Swarm results written to: {args.output}", file=sys.stderr)
    else:
        print("\n=== Swarm Execution Result ===")
        print(final_output)

if __name__ == "__main__":
    main()

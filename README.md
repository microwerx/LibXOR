# libXOR
LibXOR is a TypeScript game programming library for creating games fast! It's design is inspired by the wonder computers of the 1980s. What made those computers great was the ease of working on an idea. The downside is that speed was almost never on your side. Well, this is decades later and the author wanted to start out by creating a web based library so that game development can be as easy as including a JavaScript file in an HTML file, and let the plugging away just happen.

## Structure of the library
Everything is inside the `XOR` namespace. LibXOR is a state machine manager. Everytime it is time to do the hardware cycle, it automatically does all the drawing, starts all the sound effects, and so on.

    XOR.Graphics.Sprites.Add("Mario", "mario.jpg")
    XOR.Graphics.Sprites.AddFrame("Mario", "State", "mario1.jpg")

    XOR.Graphics.Sprites.PushBack("Actor", "State", "mario1.jpg")
    XOR.Graphics.Sprites.PushBack("Actor", "State", "mario2.jpg")

    XOR.Graphics.Sprites["Actor"].Instances[0].x = 5
    XOR.Graphics.Sprites["Actor"].Instances[0].state = "Walking"
    XOR.Graphics.Sprites["Actor"].Instances.Clear()
    XOR.Graphics.Sprites["Actor"].Templates["Walking"].animSpeed_ms = XOR.Constants.FrameTime_ms

    XOR.Graphics.Tiles[0].Load(url)
    XOR.Graphics.Tiles[255].Load(url)
    
    XOR.Graphics.TileMaps["Level 1"].Layers["Collision"].Set(x, y, value)
    XOR.Graphics.TileMaps["Level 1"].ScrollTo(left, top)

    XOR.Graphics.Vectors["Actor"].Instances[0].WorldMatrix.LoadIdentity()
    XOR.Graphics.Vectors["Actor"].Geometry.Clear()
    XOR.Graphics.Vectors["Actor"].Geometry.BeginLines()
    XOR.Graphics.Vectors["Actor"].Geometry.Color(new XOR.Color(r, g, b))
    XOR.Graphics.Vectors["Actor"].Geometry.Vertex(new XOR.Vector(x1, y2, z3))
    XOR.Graphics.Vectors["Actor"].Geometry.Vertex(new XOR.Vector(x2, y2, z3))
    XOR.Graphics.Vectors["Actor"].Geometry.End()

    XOR.Graphics.Meshes["Actor"].BeginSurface(XOR.Constants.Triangles)
    XOR.Graphics.Meshes["Actor"].Normal(x, y, z)
    XOR.Graphics.Meshes["Actor"].Vertex(x, y, z)
    XOR.Graphics.Meshes["Actor"].EndSurface()
    XOR.Graphics.Meshes["Actor"].Instances[0].WorldMatrix.LoadIdentity()

    XOR.Audio.Sounds.Stop()
    XOR.Audio.Sounds["Jump"].Load(url)
    XOR.Audio.Sounds["Jump"].Play()

    XOR.Audio.Music["level1"].Load(url)
    XOR.Audio.Music["level1"].Play()
    XOR.Audio.Music.Stop()
    
    XOR.Audio.Synthesizer.Reset()
    XOR.Audio.Synthesizer["Voice"].PitchFrequency = 440;
    XOR.Audio.Synthesizer["Voice"].FilterFrequency = 440;
    XOR.Audio.Synthesizer["Voice"].Gate = 255;
    XOR.Audio.Synthesizer["Voice"].Start(pitchFrequency, filterFrequency, gateLevel);

    XOR.Game.States.AddState("initial")
    XOR.Game.States["initial"].handler = new MyGameHandler()

    XOR.Game.States["game"] = new MyGameState()
    XOR.Game.States["game"].Add("playerDied")
    XOR.Game.States["game"].AddSequence("playerDied")
    XOR.Game.States["game"].BeginSequence("playerDied")
    XOR.Game.States["game"].EndSequence();

    XOR.Game.PushState("mainmenu")
    XOR.Game.PushState("game")
    XOR.Game.PushState("optionsmenu")
    XOR.Game.SwitchSubState("playerDied")
    XOR.Game.SwitchSubState("levelStarted")

    while (1)
    {
        XOR.PollInput()
        XOR.Update()
        XOR.RenderGraphics()
        XOR.StreamAudio()
    }

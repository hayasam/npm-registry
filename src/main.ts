import container from "./bindings";
import { Server } from "./server/Server";

container.get<Server>("Server").start();
